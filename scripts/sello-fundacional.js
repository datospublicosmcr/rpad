// scripts/sello-fundacional.js
// Script one-time para sellar el estado completo de la BD en BFA.
// Genera JSON determinístico con todos los datasets activos y sus metadatos,
// calcula SHA-256 y lo registra como sello_fundacional en blockchain.
//
// Uso: node scripts/sello-fundacional.js [--force]
//   --force: permite crear un nuevo sello aunque ya exista uno previo

import pool from '../config/database.js';
import { inicializar, calcularHash, sellarHash } from '../services/blockchainService.js';

const FORCE = process.argv.includes('--force');

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🔗 Sello Fundacional — RPAD v1.6                       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // 1. Verificar si ya existe un sello fundacional
    const [existentes] = await pool.execute(
      `SELECT id, hash_sellado, estado, block_number, confirmed_at
       FROM blockchain_registros
       WHERE tipo = 'sello_fundacional'
       ORDER BY id DESC LIMIT 1`
    );

    if (existentes.length > 0 && !FORCE) {
      const s = existentes[0];
      console.log('⚠️  Ya existe un sello fundacional:');
      console.log(`   ID: ${s.id}`);
      console.log(`   Hash: ${s.hash_sellado}`);
      console.log(`   Estado: ${s.estado}`);
      if (s.block_number) console.log(`   Bloque: ${s.block_number}`);
      if (s.confirmed_at) console.log(`   Confirmado: ${s.confirmed_at}`);
      console.log('');
      console.log('   Usá --force para crear uno nuevo igualmente.');
      console.log('');
      process.exit(0);
    }

    // 2. Inicializar blockchain
    console.log('🔗 Inicializando conexión blockchain...');
    const initResult = await inicializar();
    if (!initResult.success) {
      console.error('❌ No se pudo inicializar blockchain:', initResult.error);
      process.exit(1);
    }
    console.log(`✅ Conectado a BFA (bloque ${initResult.blockNumber})`);
    console.log('');

    // 3. Consultar estado completo del sistema
    console.log('📊 Consultando estado completo de la BD...');
    const snapshot = await obtenerSnapshotCompleto();
    console.log(`   ${snapshot.datasets.length} datasets activos encontrados`);
    console.log('');

    // 4. Generar JSON determinístico
    const jsonDeterministico = JSON.stringify(snapshot);
    console.log(`   JSON generado: ${jsonDeterministico.length} bytes`);

    // 5. Calcular SHA-256
    const hashHex = calcularHash(snapshot);
    console.log(`   SHA-256: ${hashHex}`);
    console.log('');

    // 6. Sellar en blockchain
    console.log('🔗 Sellando en blockchain...');
    const resultado = await sellarHash(hashHex, {
      tipo: 'sello_fundacional',
      referencia_id: null,
      dataset_id: null,
      metadata: snapshot
    });

    if (!resultado.success) {
      console.error('❌ Error al sellar:', resultado.error);
      process.exit(1);
    }

    console.log('');
    console.log('✅ Sello fundacional registrado exitosamente');
    console.log(`   Registro ID: ${resultado.registroId}`);
    console.log(`   Estado: ${resultado.estado}`);
    console.log(`   Hash: ${hashHex}`);
    console.log('');

    if (resultado.estado === 'enviando') {
      console.log('   La transacción se está procesando en BFA.');
      console.log('   Esperando confirmación (máximo 60 segundos)...');

      // Esperar hasta que se confirme o timeout
      const confirmado = await esperarConfirmacion(resultado.registroId, 60_000);
      if (confirmado) {
        console.log(`   ✅ Confirmado en bloque ${confirmado.block_number}`);
        console.log(`   TX: ${confirmado.tx_hash}`);
      } else {
        console.log('   ⚠️  Timeout esperando confirmación. El sello se procesará en segundo plano.');
      }
    } else if (resultado.estado === 'pendiente') {
      console.log('   ⚠️  Wallet no configurada — sello guardado como pendiente.');
      console.log('   Se sellará automáticamente cuando se configure la wallet.');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

/**
 * Consultar todos los datasets activos con sus metadatos completos.
 * Genera un snapshot determinístico ordenado por dataset.id.
 */
async function obtenerSnapshotCompleto() {
  // Datasets con área, frecuencia, tema principal y secundario
  const [datasets] = await pool.execute(`
    SELECT
      d.id,
      d.titulo,
      d.descripcion,
      d.area_id,
      a.nombre AS area_nombre,
      d.frecuencia_id,
      f.nombre AS frecuencia_nombre,
      f.dias AS frecuencia_dias,
      d.ultima_actualizacion,
      d.proxima_actualizacion,
      d.tema_principal_id,
      tp.nombre AS tema_principal_nombre,
      d.tema_secundario_id,
      ts.nombre AS tema_secundario_nombre,
      d.url_dataset,
      d.observaciones,
      d.tipo_gestion,
      d.activo
    FROM datasets d
    LEFT JOIN areas a ON d.area_id = a.id
    LEFT JOIN frecuencias f ON d.frecuencia_id = f.id
    LEFT JOIN temas tp ON d.tema_principal_id = tp.id
    LEFT JOIN temas ts ON d.tema_secundario_id = ts.id
    WHERE d.activo = 1
    ORDER BY d.id ASC
  `);

  // Formatos por dataset
  const [formatos] = await pool.execute(`
    SELECT df.dataset_id, fo.id AS formato_id, fo.nombre AS formato_nombre
    FROM dataset_formatos df
    INNER JOIN formatos fo ON df.formato_id = fo.id
    INNER JOIN datasets d ON df.dataset_id = d.id
    WHERE d.activo = 1
    ORDER BY df.dataset_id ASC, fo.id ASC
  `);

  // Agrupar formatos por dataset_id
  const formatosPorDataset = {};
  for (const f of formatos) {
    if (!formatosPorDataset[f.dataset_id]) formatosPorDataset[f.dataset_id] = [];
    formatosPorDataset[f.dataset_id].push({
      id: f.formato_id,
      nombre: f.formato_nombre
    });
  }

  // Armar snapshot con formatos incluidos
  const datasetsConFormatos = datasets.map(d => ({
    id: d.id,
    titulo: d.titulo,
    descripcion: d.descripcion,
    area_id: d.area_id,
    area_nombre: d.area_nombre,
    frecuencia_id: d.frecuencia_id,
    frecuencia_nombre: d.frecuencia_nombre,
    frecuencia_dias: d.frecuencia_dias,
    ultima_actualizacion: d.ultima_actualizacion ? d.ultima_actualizacion.toISOString().split('T')[0] : null,
    proxima_actualizacion: d.proxima_actualizacion ? d.proxima_actualizacion.toISOString().split('T')[0] : null,
    tema_principal_id: d.tema_principal_id,
    tema_principal_nombre: d.tema_principal_nombre,
    tema_secundario_id: d.tema_secundario_id,
    tema_secundario_nombre: d.tema_secundario_nombre,
    url_dataset: d.url_dataset,
    observaciones: d.observaciones,
    tipo_gestion: d.tipo_gestion,
    formatos: formatosPorDataset[d.id] || []
  }));

  return {
    version: '1.6',
    tipo: 'sello_fundacional',
    timestamp: new Date().toISOString(),
    total_datasets: datasetsConFormatos.length,
    datasets: datasetsConFormatos
  };
}

/**
 * Esperar a que un registro se confirme en blockchain (polling a BD).
 */
async function esperarConfirmacion(registroId, timeoutMs) {
  const inicio = Date.now();
  const intervalo = 3000; // consultar cada 3 segundos

  while (Date.now() - inicio < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, intervalo));

    const [rows] = await pool.execute(
      `SELECT estado, block_number, tx_hash FROM blockchain_registros WHERE id = ?`,
      [registroId]
    );

    if (rows.length > 0 && rows[0].estado === 'confirmado') {
      return rows[0];
    }
  }

  return null;
}

main();
