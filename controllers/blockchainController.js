/**
 * Controlador para endpoints de blockchain (BFA)
 * Rutas públicas de verificación + estado del servicio (protegido)
 */

import pool from '../config/database.js';
import { verificarHash, obtenerSello, getEstado, sellarHash } from '../services/blockchainService.js';

/**
 * GET /api/blockchain/verificar/:hash
 * Público — Verificar si un hash fue sellado en blockchain
 */
export const verificar = async (req, res) => {
  try {
    const { hash } = req.params;

    // Validar formato de hash (0x + 64 hex)
    if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        error: 'Hash inválido. Formato esperado: 0x seguido de 64 caracteres hexadecimales'
      });
    }

    const resultado = await obtenerSello(hash);
    res.json(resultado);
  } catch (error) {
    console.error('Error en verificar hash:', error);
    res.status(500).json({ success: false, error: 'Error al verificar el hash' });
  }
};

/**
 * GET /api/blockchain/estado
 * Protegido — Estado del servicio blockchain (conexión, balance, stats)
 */
export const estado = async (req, res) => {
  try {
    const resultado = await getEstado();
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo estado blockchain:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estado del servicio' });
  }
};

/**
 * GET /api/blockchain/registro
 * Público — Listado paginado de operaciones selladas
 * Query params: page, limit, area_id, tipo_cambio
 */
export const registro = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { area_id, tipo_cambio } = req.query;

    let whereClause = "WHERE br.estado = 'confirmado'";
    const params = [];

    if (area_id) {
      whereClause += ' AND d.area_id = ?';
      params.push(area_id);
    }

    if (tipo_cambio) {
      whereClause += ' AND br.tipo = ? ';
      params.push(tipo_cambio);
    }

    // Contar total
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM blockchain_registros br
       LEFT JOIN datasets d ON br.dataset_id = d.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Obtener registros
    const [rows] = await pool.execute(
      `SELECT br.id, br.tipo, br.hash_sellado, br.file_hash, br.filename, br.tx_hash,
              br.block_number, br.network, br.estado, br.created_at, br.confirmed_at,
              d.titulo AS dataset_titulo,
              a.nombre AS area_nombre
       FROM blockchain_registros br
       LEFT JOIN datasets d ON br.dataset_id = d.id
       LEFT JOIN areas a ON d.area_id = a.id
       ${whereClause}
       ORDER BY br.confirmed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Para cada cambio_dataset, buscar si tiene certificacion_archivo asociada
    const registros = rows.map(row => ({
      ...row,
      tiene_archivo_certificado: false
    }));

    // Buscar file_hashes asociados por referencia_id
    const cambioIds = registros
      .filter(r => r.tipo === 'cambio_dataset')
      .map(r => r.id);

    if (cambioIds.length > 0) {
      const [archivos] = await pool.execute(
        `SELECT referencia_id FROM blockchain_registros
         WHERE tipo = 'certificacion_archivo' AND estado = 'confirmado'
           AND referencia_id IN (
             SELECT referencia_id FROM blockchain_registros WHERE id IN (${cambioIds.map(() => '?').join(',')})
           )`,
        cambioIds
      );
      const refsConArchivo = new Set(archivos.map(a => a.referencia_id));

      for (const reg of registros) {
        if (reg.tipo === 'cambio_dataset') {
          // Buscar referencia_id de este registro para comparar
          const [refRows] = await pool.execute(
            'SELECT referencia_id FROM blockchain_registros WHERE id = ?',
            [reg.id]
          );
          if (refRows.length > 0 && refsConArchivo.has(refRows[0].referencia_id)) {
            reg.tiene_archivo_certificado = true;
          }
        }
      }
    }

    res.json({
      success: true,
      data: registros,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo registro blockchain:', error);
    res.status(500).json({ success: false, error: 'Error al obtener el registro' });
  }
};

/**
 * GET /api/blockchain/dataset/:id
 * Público — Registros blockchain de un dataset específico
 */
export const registrosPorDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT br.id, br.tipo, br.hash_sellado, br.file_hash, br.filename, br.tx_hash,
              br.block_number, br.network, br.estado, br.created_at, br.confirmed_at,
              br.referencia_id
       FROM blockchain_registros br
       WHERE br.dataset_id = ? AND br.estado = 'confirmado'
       ORDER BY br.confirmed_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        registros: rows,
        total: rows.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo registros por dataset:', error);
    res.status(500).json({ success: false, error: 'Error al obtener registros del dataset' });
  }
};

/**
 * POST /api/blockchain/certificar
 * Protegido — Certificación voluntaria de archivo(s) en blockchain
 * Body: { dataset_id, archivos: [{ file_hash, filename }] }
 * Compatibilidad: también acepta { dataset_id, file_hash } (formato anterior)
 */
export const certificar = async (req, res) => {
  try {
    const { dataset_id, file_hash, archivos: archivosRaw } = req.body;

    // Validar dataset_id
    if (!dataset_id) {
      return res.status(400).json({ success: false, error: 'dataset_id es obligatorio' });
    }

    const [dsRows] = await pool.execute(
      'SELECT id, titulo, activo FROM datasets WHERE id = ?',
      [dataset_id]
    );

    if (dsRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Dataset no encontrado' });
    }

    if (!dsRows[0].activo) {
      return res.status(400).json({ success: false, error: 'Solo se pueden certificar archivos de datasets activos' });
    }

    // Compatibilidad hacia atrás: si viene file_hash en vez de archivos, convertir
    let archivos;
    if (archivosRaw && Array.isArray(archivosRaw)) {
      archivos = archivosRaw;
    } else if (file_hash) {
      archivos = [{ file_hash, filename: null }];
    } else {
      return res.status(400).json({ success: false, error: 'Debe enviar archivos (array) o file_hash' });
    }

    if (archivos.length === 0) {
      return res.status(400).json({ success: false, error: 'El array de archivos no puede estar vacío' });
    }

    const MAX_ARCHIVOS_POR_REQUEST = 20;
    if (archivos.length > MAX_ARCHIVOS_POR_REQUEST) {
      return res.status(400).json({
        success: false,
        error: `Máximo ${MAX_ARCHIVOS_POR_REQUEST} archivos por solicitud`
      });
    }

    // Validar cada archivo
    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      if (!archivo.file_hash || !/^(0x)?[0-9a-fA-F]{64}$/.test(archivo.file_hash)) {
        return res.status(400).json({
          success: false,
          error: `file_hash inválido en archivo ${i + 1}. Formato esperado: 0x seguido de 64 caracteres hexadecimales`
        });
      }
      if (archivo.filename !== undefined && archivo.filename !== null && typeof archivo.filename !== 'string') {
        return res.status(400).json({
          success: false,
          error: `filename inválido en archivo ${i + 1}. Debe ser un string`
        });
      }
    }

    // Sellar cada archivo individualmente
    const resultados = [];
    for (const archivo of archivos) {
      const hashNormalizado = archivo.file_hash.startsWith('0x') ? archivo.file_hash : `0x${archivo.file_hash}`;

      const resultado = await sellarHash(hashNormalizado, {
        tipo: 'certificacion_archivo',
        referencia_id: null,
        dataset_id,
        filename: archivo.filename || null,
        metadata: { file_hash: hashNormalizado, filename: archivo.filename || null, dataset_id, timestamp: new Date().toISOString() }
      });

      resultados.push({
        file_hash: hashNormalizado,
        filename: archivo.filename || null,
        registroId: resultado.registroId || null,
        estado: resultado.estado || 'error',
        success: resultado.success
      });

      if (resultado.success) {
        console.log(`✅ Certificación voluntaria: dataset #${dataset_id}, archivo "${archivo.filename || 'sin nombre'}", registro #${resultado.registroId}`);
      }
    }

    const todosExitosos = resultados.every(r => r.success);

    res.json({
      success: todosExitosos,
      data: resultados.length === 1
        ? { registroId: resultados[0].registroId, estado: resultados[0].estado }
        : { resultados }
    });
  } catch (error) {
    console.error('Error en certificar archivo:', error);
    res.status(500).json({ success: false, error: 'Error al certificar el archivo' });
  }
};
