// services/blockchainService.js
// Servicio centralizado para interacción con Blockchain Federal Argentina (BFA)
// Contrato TSA2 (Stamper.sol) — sellado de hashes SHA-256

import { Web3 } from 'web3';
import fs from 'fs';
import crypto from 'crypto';
import pool from '../config/database.js';

// ABI limpia del contrato TSA2 (sin campos signature de Truffle)
const TSA2_ABI = [
  {
    constant: false,
    inputs: [{ name: 'objectList', type: 'bytes32[]' }],
    name: 'put',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'object', type: 'bytes32' }],
    name: 'getObjectCount',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'object', type: 'bytes32' }, { name: 'stamper', type: 'address' }],
    name: 'getBlockNo',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'pos', type: 'uint256' }],
    name: 'getStamplistPos',
    outputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'address' }, { name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'object', type: 'bytes32' }, { name: 'pos', type: 'uint256' }],
    name: 'getObjectPos',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'stamper', type: 'address' }],
    name: 'getStamperCount',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'stamper', type: 'address' }, { name: 'pos', type: 'uint256' }],
    name: 'getStamperPos',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'object', type: 'bytes32' },
      { indexed: false, name: 'blockNo', type: 'uint256' }
    ],
    name: 'Stamped',
    type: 'event'
  }
];

// ============================================================
// Estado del servicio
// ============================================================

let web3 = null;
let contract = null;
let cuenta = null;        // Web3Account { address, privateKey, signTransaction }
let inicializadoOk = false;

// Cola de transacciones — serializa envíos para evitar colisión de nonce
let txQueue = Promise.resolve();

// Cola de reintentos
let reintentoTimer = null;
const REINTENTO_INTERVALO_MS = 60_000; // 1 minuto
const MAX_REINTENTOS = 10;

// ============================================================
// Funciones públicas
// ============================================================

/**
 * Inicializar conexión a BFA, contrato TSA2 y wallet.
 * Se llama una vez al arrancar el servidor (desde app.js).
 * Sin wallet funciona en modo lectura (verificación sin sellado).
 */
export async function inicializar() {
  if (inicializadoOk) return { success: true, message: 'Ya inicializado' };

  const rpcUrl = process.env.BFA_RPC_URL;
  const contractAddress = process.env.BFA_CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress) {
    console.log('⚠️ Blockchain: configuración BFA incompleta — servicio deshabilitado');
    return { success: false, error: 'BFA_RPC_URL o BFA_CONTRACT_ADDRESS no configurados' };
  }

  try {
    // Conectar al nodo BFA
    web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

    // Verificar conexión y chain ID
    const chainId = await web3.eth.getChainId();
    const chainIdEsperado = process.env.BFA_CHAIN_ID;
    if (chainIdEsperado && chainId !== BigInt(chainIdEsperado)) {
      throw new Error(`Chain ID incorrecto: ${chainId} (esperado: ${chainIdEsperado})`);
    }

    // Cargar contrato TSA2
    contract = new web3.eth.Contract(TSA2_ABI, contractAddress);

    // Cargar wallet (opcional — sin wallet queda en modo lectura)
    await cargarWallet();

    inicializadoOk = true;

    // Iniciar cola de reintentos para sellos pendientes
    iniciarReintentos();

    const blockNumber = await web3.eth.getBlockNumber();
    console.log(`🔗 Blockchain: conectado a BFA (chain ${chainId}, bloque ${blockNumber})`);

    return { success: true, chainId: Number(chainId), blockNumber: Number(blockNumber) };
  } catch (error) {
    console.error('❌ Blockchain: error al inicializar:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Calcular hash SHA-256 de un objeto (para datosParaSellar).
 * Devuelve string con prefijo 0x (66 caracteres).
 */
export function calcularHash(datos) {
  const json = JSON.stringify(datos);
  const hash = crypto.createHash('sha256').update(json, 'utf8').digest('hex');
  return '0x' + hash;
}

/**
 * Sellar un hash en blockchain y registrar en BD.
 * No bloqueante: si la transacción falla, queda pendiente para reintento automático.
 *
 * @param {string} hashHex - Hash 0x-prefixed (66 chars)
 * @param {Object} datos
 * @param {string} datos.tipo - 'cambio_dataset' | 'certificacion_archivo' | 'sello_fundacional'
 * @param {number|null} datos.referencia_id - ID del cambio_pendiente (null para sello_fundacional)
 * @param {number|null} datos.dataset_id - ID del dataset (null para sello_fundacional)
 * @param {Object|null} datos.metadata - Datos completos que se hashearon (para auditoría interna)
 * @returns {{ success, registroId, estado }}
 */
export async function sellarHash(hashHex, datos) {
  const { tipo, referencia_id = null, dataset_id = null, metadata = null, filename = null } = datos;

  // Registrar en BD como pendiente
  let registroId;
  try {
    const fileHash = tipo === 'certificacion_archivo' ? hashHex : null;
    const [result] = await pool.execute(
      `INSERT INTO blockchain_registros
       (tipo, referencia_id, dataset_id, hash_sellado, file_hash, filename, network, estado, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
      [
        tipo,
        referencia_id,
        dataset_id,
        hashHex,
        fileHash,
        tipo === 'certificacion_archivo' ? filename : null,
        process.env.BFA_NETWORK || 'produccion',
        metadata ? JSON.stringify(metadata) : null
      ]
    );
    registroId = result.insertId;
  } catch (error) {
    console.error('❌ Blockchain: error registrando en BD:', error.message);
    return { success: false, error: error.message };
  }

  // Sin wallet → queda pendiente para cuando se configure
  if (!cuenta) {
    console.log(`⚠️ Blockchain: registro #${registroId} guardado como pendiente (sin wallet)`);
    return { success: true, registroId, estado: 'pendiente' };
  }

  // Enviar sello de forma asíncrona (no bloquea la respuesta al usuario)
  enviarSello(registroId, hashHex).catch(async (error) => {
    console.error(`❌ Blockchain: error sellando registro #${registroId}:`, error.message);
    try {
      await pool.execute(
        'UPDATE blockchain_registros SET intentos = 1, error_detalle = ? WHERE id = ?',
        [error.message, registroId]
      );
    } catch (dbError) {
      console.error('Error actualizando intento fallido:', dbError.message);
    }
  });

  return { success: true, registroId, estado: 'pendiente' };
}

/**
 * Verificar si un hash fue sellado en blockchain.
 * Consulta directamente al contrato TSA2.
 *
 * @param {string} hashHex - Hash 0x-prefixed
 */
export async function verificarHash(hashHex) {
  if (!inicializadoOk || !contract) {
    return { success: false, error: 'Servicio blockchain no inicializado' };
  }

  try {
    const count = await contract.methods.getObjectCount(hashHex).call();
    const encontrado = Number(count) > 0;

    let blockNumber = null;
    let timestamp = null;

    if (encontrado) {
      // Buscar sello de nuestra wallet
      const walletAddress = process.env.BFA_WALLET_ADDRESS;
      if (walletAddress) {
        const blockNo = await contract.methods.getBlockNo(hashHex, walletAddress).call();
        if (Number(blockNo) > 0) {
          blockNumber = Number(blockNo);
          timestamp = await obtenerTimestampBloque(blockNo);
        }
      }

      // Si no lo selló nuestra wallet, buscar el primer sello (posición 0)
      if (!blockNumber) {
        const pos = await contract.methods.getObjectPos(hashHex, 0).call();
        const stampData = await contract.methods.getStamplistPos(pos).call();
        // web3.js v4 devuelve objeto { '0': hash, '1': stamper, '2': blockNo }, no array
        blockNumber = Number(stampData[2]);
        timestamp = await obtenerTimestampBloque(stampData[2]);
      }
    }

    return { success: true, encontrado, count: Number(count), blockNumber, timestamp };
  } catch (error) {
    console.error('❌ Blockchain: error verificando hash:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener detalles completos de un sello (BD + blockchain).
 * Usado por el endpoint público de verificación.
 *
 * @param {string} hashHex - Hash 0x-prefixed
 */
export async function obtenerSello(hashHex) {
  try {
    // Buscar en BD (por hash_sellado, file_hash o tx_hash)
    const [rows] = await pool.execute(
      `SELECT br.*, d.titulo AS dataset_titulo, a.nombre AS area_nombre
       FROM blockchain_registros br
       LEFT JOIN datasets d ON br.dataset_id = d.id
       LEFT JOIN areas a ON d.area_id = a.id
       WHERE br.hash_sellado = ? OR br.file_hash = ? OR br.tx_hash = ?
       ORDER BY br.created_at DESC LIMIT 1`,
      [hashHex, hashHex, hashHex]
    );

    if (rows.length === 0) {
      // No está en nuestra BD — verificar directo en blockchain
      if (inicializadoOk) {
        const verificacion = await verificarHash(hashHex);
        if (verificacion.encontrado) {
          // Normalizar respuesta para que el frontend reciba los mismos campos que desde BD
          return {
            success: true,
            encontrado: true,
            fuente: 'blockchain',
            hash_sellado: hashHex,
            block_number: verificacion.blockNumber || null,
            block_timestamp: verificacion.timestamp || null,
            confirmed_at: verificacion.timestamp || null,
            network: process.env.BFA_NETWORK || 'produccion',
            estado: 'confirmado'
          };
        }
        return { success: true, encontrado: false };
      }
      return { success: true, encontrado: false };
    }

    const reg = rows[0];

    // Datos públicos (sin metadata interna)
    const resultado = {
      success: true,
      encontrado: true,
      fuente: 'bd',
      tipo: reg.tipo,
      dataset_titulo: reg.dataset_titulo,
      area_nombre: reg.area_nombre,
      hash_sellado: reg.hash_sellado,
      file_hash: reg.file_hash,
      filename: reg.filename || null,
      tx_hash: reg.tx_hash,
      block_number: reg.block_number,
      network: reg.network,
      estado: reg.estado,
      timestamp: reg.created_at,
      confirmed_at: reg.confirmed_at,
      referencia_id: reg.referencia_id || null
    };

    // Si está confirmado, intentar obtener timestamp del bloque
    if (reg.estado === 'confirmado' && reg.block_number && inicializadoOk) {
      resultado.block_timestamp = await obtenerTimestampBloque(BigInt(reg.block_number));
    }

    // Si tiene referencia_id, buscar todos los registros del mismo grupo
    if (reg.referencia_id) {
      try {
        const [grupoRows] = await pool.execute(
          `SELECT br.id, br.tipo, br.hash_sellado, br.file_hash, br.filename, br.estado, br.confirmed_at
           FROM blockchain_registros br
           WHERE br.referencia_id = ? AND br.id != ?
           ORDER BY br.tipo ASC, br.created_at ASC`,
          [reg.referencia_id, reg.id]
        );
        if (grupoRows.length > 0) {
          resultado.grupo = grupoRows;
        }
      } catch (grupoError) {
        console.error('Error obteniendo grupo de registros:', grupoError.message);
      }
    }

    return resultado;
  } catch (error) {
    console.error('❌ Blockchain: error obteniendo sello:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Estado general del servicio blockchain.
 * Usado por el endpoint /api/blockchain/estado (protegido).
 */
export async function getEstado() {
  const estado = {
    inicializado: inicializadoOk,
    wallet: cuenta ? cuenta.address : null,
    modoLectura: !cuenta,
    red: 'BFA Producción',
    contractAddress: process.env.BFA_CONTRACT_ADDRESS || null,
    network: process.env.BFA_NETWORK || 'produccion'
  };

  if (!inicializadoOk || !web3) {
    return { success: true, ...estado, conectado: false };
  }

  try {
    const [chainId, blockNumber] = await Promise.all([
      web3.eth.getChainId(),
      web3.eth.getBlockNumber()
    ]);

    estado.conectado = true;
    estado.chainId = Number(chainId);
    estado.blockNumber = Number(blockNumber);

    if (cuenta) {
      const balance = await web3.eth.getBalance(cuenta.address);
      estado.balance = web3.utils.fromWei(balance, 'ether');

      const stamperCount = await contract.methods.getStamperCount(cuenta.address).call();
      estado.totalSellos = Number(stamperCount);
    }

    // Sellos pendientes en BD
    const [pendientes] = await pool.execute(
      `SELECT COUNT(*) AS total FROM blockchain_registros WHERE estado = 'pendiente'`
    );
    estado.sellosPendientes = pendientes[0].total;

    // Sellos con error
    const [errores] = await pool.execute(
      `SELECT COUNT(*) AS total FROM blockchain_registros WHERE estado = 'error'`
    );
    estado.sellosConError = errores[0].total;

    return { success: true, ...estado };
  } catch (error) {
    console.error('❌ Blockchain: error obteniendo estado:', error.message);
    return { success: true, ...estado, conectado: false, error: error.message };
  }
}

// ============================================================
// Funciones internas
// ============================================================

/**
 * Cargar wallet desde keyfile encriptado.
 * Si no hay keyfile configurado, el servicio queda en modo lectura.
 */
async function cargarWallet() {
  const keyfilePath = process.env.BFA_KEYFILE_PATH;
  const password = process.env.BFA_WALLET_PASSWORD;

  if (!keyfilePath || !password) {
    console.log('⚠️ Blockchain: BFA_KEYFILE_PATH o BFA_WALLET_PASSWORD no configurados — modo solo lectura');
    return;
  }

  if (!fs.existsSync(keyfilePath)) {
    console.log(`⚠️ Blockchain: keyfile no encontrado en ${keyfilePath} — modo solo lectura`);
    return;
  }

  const keyJson = JSON.parse(fs.readFileSync(keyfilePath, 'utf8'));
  cuenta = await web3.eth.accounts.decrypt(keyJson, password);
  web3.eth.accounts.wallet.add(cuenta);

  const balance = await web3.eth.getBalance(cuenta.address);
  console.log(`🔗 Blockchain: wallet ${cuenta.address} cargada (${web3.utils.fromWei(balance, 'ether')} ETH)`);
}

/**
 * Enviar transacción de sello al contrato TSA2.
 * Serializada por la cola txQueue para evitar colisiones de nonce.
 */
async function enviarSello(registroId, hashHex) {
  return enqueueTransaction(async () => {
    // Verificar si ya fue sellado por nuestra wallet (evitar gastar gas en duplicados)
    const blockNo = await contract.methods.getBlockNo(hashHex, cuenta.address).call();
    if (Number(blockNo) > 0) {
      console.log(`⚠️ Blockchain: hash ${hashHex.slice(0, 14)}... ya sellado en bloque ${blockNo}`);
      await pool.execute(
        `UPDATE blockchain_registros SET estado = 'confirmado', block_number = ?, confirmed_at = NOW() WHERE id = ?`,
        [Number(blockNo), registroId]
      );
      return;
    }

    // Preparar transacción (legacy type 0 — BFA es POA con gasPrice 0)
    const nonce = await web3.eth.getTransactionCount(cuenta.address);
    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
      to: process.env.BFA_CONTRACT_ADDRESS,
      gas: parseInt(process.env.BFA_GAS_LIMIT || '2000000'),
      gasPrice,
      data: contract.methods.put([hashHex]).encodeABI(),
      chainId: BigInt(process.env.BFA_CHAIN_ID || '200941592'),
      nonce
    };

    // Firmar y enviar
    const signedTx = await web3.eth.accounts.signTransaction(tx, cuenta.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const blockNumber = Number(receipt.blockNumber);
    const txHash = receipt.transactionHash;

    console.log(`✅ Blockchain: registro #${registroId} sellado en bloque ${blockNumber} (tx: ${txHash})`);

    // Actualizar registro en BD
    await pool.execute(
      `UPDATE blockchain_registros
       SET estado = 'confirmado', tx_hash = ?, block_number = ?, confirmed_at = NOW()
       WHERE id = ?`,
      [txHash, blockNumber, registroId]
    );
  });
}

/**
 * Serializar transacciones para evitar colisiones de nonce.
 * Cada transacción espera a que la anterior termine antes de pedir nonce.
 */
function enqueueTransaction(fn) {
  const promise = txQueue.then(fn);
  // La cola no se bloquea si una transacción falla
  txQueue = promise.catch(() => {});
  return promise;
}

/**
 * Obtener timestamp de un bloque.
 * Puede fallar con bloques POA (extraData > 32 bytes) — no es crítico.
 */
async function obtenerTimestampBloque(blockNumber) {
  try {
    const block = await web3.eth.getBlock(blockNumber);
    return block ? new Date(Number(block.timestamp) * 1000).toISOString() : null;
  } catch {
    return null;
  }
}

/**
 * Iniciar procesamiento periódico de sellos pendientes.
 * Busca registros con estado='pendiente' e intenta sellarlos.
 */
function iniciarReintentos() {
  if (reintentoTimer) return;

  reintentoTimer = setInterval(async () => {
    if (!cuenta) return;

    try {
      const [pendientes] = await pool.execute(
        `SELECT id, hash_sellado, intentos
         FROM blockchain_registros
         WHERE estado = 'pendiente' AND intentos < ?
         ORDER BY created_at ASC LIMIT 5`,
        [MAX_REINTENTOS]
      );

      for (const reg of pendientes) {
        try {
          await enviarSello(reg.id, reg.hash_sellado);
        } catch (error) {
          const nuevosIntentos = reg.intentos + 1;
          await pool.execute(
            `UPDATE blockchain_registros
             SET intentos = ?, error_detalle = ?, estado = ?
             WHERE id = ?`,
            [
              nuevosIntentos,
              error.message,
              nuevosIntentos >= MAX_REINTENTOS ? 'error' : 'pendiente',
              reg.id
            ]
          );
          console.error(`❌ Blockchain: reintento #${nuevosIntentos} fallido para registro #${reg.id}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('❌ Blockchain: error procesando cola de reintentos:', error.message);
    }
  }, REINTENTO_INTERVALO_MS);
}
