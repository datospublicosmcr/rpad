import pool from '../config/database.js';

// Query base para obtener datasets con datos relacionados
const DATASET_SELECT_QUERY = `
  SELECT 
    d.*,
    f.nombre AS frecuencia_nombre,
    f.dias AS frecuencia_dias,
    tp.nombre AS tema_principal_nombre,
    ts.nombre AS tema_secundario_nombre,
    a.nombre AS area_nombre,
    a.area_superior AS area_superior,
    a.email_principal AS area_email_principal,
    a.email_secundario AS area_email_secundario,
    a.telefono_area AS area_telefono,
    a.celular_area AS area_celular,
    a.nombre_contacto AS area_contacto_nombre,
    a.telefono_contacto AS area_contacto_telefono,
    a.email_contacto AS area_contacto_email,
    GROUP_CONCAT(DISTINCT fmt.nombre ORDER BY fmt.nombre SEPARATOR ', ') AS formatos
  FROM datasets d
  LEFT JOIN frecuencias f ON d.frecuencia_id = f.id
  LEFT JOIN temas tp ON d.tema_principal_id = tp.id
  LEFT JOIN temas ts ON d.tema_secundario_id = ts.id
  LEFT JOIN areas a ON d.area_id = a.id
  LEFT JOIN dataset_formatos df ON d.id = df.dataset_id
  LEFT JOIN formatos fmt ON df.formato_id = fmt.id
  WHERE d.activo = TRUE
`;

// Función auxiliar para calcular estado
// Ahora considera tipo_gestion para diferenciar 'atrasado' de 'sin-respuesta'
function calcularEstado(proximaActualizacion, frecuenciaDias, tipoGestion = 'externa') {
  // Si es frecuencia eventual (sin días definidos), siempre está actualizado
  if (frecuenciaDias === null) {
    return 'actualizado';
  }

  if (!proximaActualizacion) {
    return 'sin-fecha';
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const proxima = new Date(proximaActualizacion);
  proxima.setHours(0, 0, 0, 0);
  
  const diffDias = Math.floor((proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    // Dataset vencido: diferenciar según tipo de gestión
    return tipoGestion === 'interna' ? 'atrasado' : 'sin-respuesta';
  }
  if (diffDias <= 60) return 'proximo';
  return 'actualizado';
}

// Obtener todos los datasets
export const getDatasets = async (req, res) => {
  try {
    const { tema, frecuencia, estado, busqueda } = req.query;

    let query = DATASET_SELECT_QUERY;
    const params = [];

    // Filtro por tema
    if (tema && tema !== 'todos') {
      query += ' AND tp.nombre = ?';
      params.push(tema);
    }

    // Filtro por frecuencia
    if (frecuencia && frecuencia !== 'todas') {
      query += ' AND f.nombre = ?';
      params.push(frecuencia);
    }

    // Filtro por búsqueda
    if (busqueda) {
      query += ' AND (d.titulo LIKE ? OR a.nombre LIKE ? OR d.descripcion LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY d.id ORDER BY d.proxima_actualizacion ASC, d.titulo ASC';

    const [rows] = await pool.execute(query, params);
    let datasets = rows;

    // Filtro por estado (se hace en memoria porque depende de la fecha actual)
    if (estado && estado !== 'todos') {
      datasets = datasets.filter(d => {
        const estadoDataset = calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
        return estadoDataset === estado;
      });
    }

    res.json({
      success: true,
      data: datasets
    });
  } catch (error) {
    console.error('Error obteniendo datasets:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los datasets'
    });
  }
};

// Obtener un dataset por ID
export const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      DATASET_SELECT_QUERY + ' AND d.id = ? GROUP BY d.id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dataset no encontrado'
      });
    }

    const dataset = rows[0];
    
    // Obtener formatos como array de objetos (para edición)
    const [formatosRows] = await pool.execute(
      `SELECT f.id, f.nombre 
       FROM dataset_formatos df
       JOIN formatos f ON df.formato_id = f.id
       WHERE df.dataset_id = ?
       ORDER BY f.nombre`,
      [id]
    );
    
    dataset.formatos_array = formatosRows;

    res.json({
      success: true,
      data: dataset
    });
  } catch (error) {
    console.error('Error obteniendo dataset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el dataset'
    });
  }
};

// Crear nuevo dataset
export const createDataset = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const data = req.body;

    // Validaciones básicas
    if (!data.titulo || !data.area_id || !data.frecuencia_id || 
        !data.formatos || !Array.isArray(data.formatos) || data.formatos.length === 0 ||
        !data.tema_principal_id || !data.tipo_gestion) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios: titulo, area_id, frecuencia_id, formatos (array con al menos 1), tema_principal_id, tipo_gestion'
      });
    }

    // Validar que tipo_gestion sea válido
    if (!['interna', 'externa'].includes(data.tipo_gestion)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'tipo_gestion debe ser "interna" o "externa"'
      });
    }

    // Extraer IDs de formatos (pueden venir como objetos o números)
    const formatoIds = data.formatos.map(f => typeof f === 'object' ? f.id : f);
    
    // Validar que los formatos existan
    const [formatosExistentes] = await connection.execute(
      `SELECT id FROM formatos WHERE id IN (${formatoIds.map(() => '?').join(',')}) AND activo = 1`,
      formatoIds
    );
    
    if (formatosExistentes.length !== formatoIds.length) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'Uno o más formatos no son válidos'
      });
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // Insertar dataset
    const [result] = await connection.execute(
      `INSERT INTO datasets (
        titulo, descripcion, area_id, frecuencia_id, 
        ultima_actualizacion, proxima_actualizacion, 
        tema_principal_id, tema_secundario_id, 
        url_dataset, observaciones, tipo_gestion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.titulo,
        data.descripcion || null,
        data.area_id,
        data.frecuencia_id,
        data.ultima_actualizacion || null,
        data.proxima_actualizacion || null,
        data.tema_principal_id,
        data.tema_secundario_id || null,
        data.url_dataset || null,
        data.observaciones || null,
        data.tipo_gestion
      ]
    );

    const datasetId = result.insertId;

    // Insertar relaciones con formatos
    for (const formatoId of formatoIds) {
      await connection.execute(
        'INSERT INTO dataset_formatos (dataset_id, formato_id) VALUES (?, ?)',
        [datasetId, formatoId]
      );
    }

    // Confirmar transacción
    await connection.commit();
    connection.release();

    // Obtener el dataset creado con todos los datos
    const [rows] = await pool.execute(
      DATASET_SELECT_QUERY + ' AND d.id = ? GROUP BY d.id',
      [datasetId]
    );

    res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Dataset creado correctamente'
    });
  } catch (error) {
    // Rollback en caso de error
    await connection.rollback();
    connection.release();
    
    console.error('Error creando dataset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el dataset'
    });
  }
};

// Actualizar dataset
export const updateDataset = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar que el dataset existe
    const [existing] = await connection.execute(
      'SELECT id FROM datasets WHERE id = ? AND activo = TRUE',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        error: 'Dataset no encontrado'
      });
    }

    // Validar tipo_gestion si se proporciona
    if (data.tipo_gestion !== undefined && !['interna', 'externa'].includes(data.tipo_gestion)) {
      connection.release();
      return res.status(400).json({
        success: false,
        error: 'tipo_gestion debe ser "interna" o "externa"'
      });
    }

    // Construir query dinámico para campos del dataset
    const updates = [];
    const values = [];

    if (data.titulo !== undefined) {
      updates.push('titulo = ?');
      values.push(data.titulo);
    }
    if (data.descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(data.descripcion || null);
    }
    if (data.area_id !== undefined) {
      updates.push('area_id = ?');
      values.push(data.area_id);
    }
    if (data.frecuencia_id !== undefined) {
      updates.push('frecuencia_id = ?');
      values.push(data.frecuencia_id);
    }
    if (data.ultima_actualizacion !== undefined) {
      updates.push('ultima_actualizacion = ?');
      values.push(data.ultima_actualizacion || null);
    }
    if (data.proxima_actualizacion !== undefined) {
      updates.push('proxima_actualizacion = ?');
      values.push(data.proxima_actualizacion || null);
    }
    if (data.tema_principal_id !== undefined) {
      updates.push('tema_principal_id = ?');
      values.push(data.tema_principal_id);
    }
    if (data.tema_secundario_id !== undefined) {
      updates.push('tema_secundario_id = ?');
      values.push(data.tema_secundario_id || null);
    }
    if (data.url_dataset !== undefined) {
      updates.push('url_dataset = ?');
      values.push(data.url_dataset || null);
    }
    if (data.observaciones !== undefined) {
      updates.push('observaciones = ?');
      values.push(data.observaciones || null);
    }
    if (data.tipo_gestion !== undefined) {
      updates.push('tipo_gestion = ?');
      values.push(data.tipo_gestion);
    }
    if (data.activo !== undefined) {
      updates.push('activo = ?');
      values.push(data.activo);
    }

    // Validar formatos si se proporcionan
    let formatoIds = null;
    if (data.formatos !== undefined) {
      if (!Array.isArray(data.formatos) || data.formatos.length === 0) {
        connection.release();
        return res.status(400).json({
          success: false,
          error: 'formatos debe ser un array con al menos 1 elemento'
        });
      }
      
      formatoIds = data.formatos.map(f => typeof f === 'object' ? f.id : f);
      
      // Validar que los formatos existan
      const [formatosExistentes] = await connection.execute(
        `SELECT id FROM formatos WHERE id IN (${formatoIds.map(() => '?').join(',')}) AND activo = 1`,
        formatoIds
      );
      
      if (formatosExistentes.length !== formatoIds.length) {
        connection.release();
        return res.status(400).json({
          success: false,
          error: 'Uno o más formatos no son válidos'
        });
      }
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // Actualizar dataset si hay cambios
    if (updates.length > 0) {
      values.push(Number(id));
      await connection.execute(
        `UPDATE datasets SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Actualizar formatos si se proporcionaron
    if (formatoIds !== null) {
      // Eliminar relaciones existentes
      await connection.execute('DELETE FROM dataset_formatos WHERE dataset_id = ?', [id]);
      
      // Insertar nuevas relaciones
      for (const formatoId of formatoIds) {
        await connection.execute(
          'INSERT INTO dataset_formatos (dataset_id, formato_id) VALUES (?, ?)',
          [id, formatoId]
        );
      }
    }

    // Confirmar transacción
    await connection.commit();
    connection.release();

    // Obtener el dataset actualizado
    const [rows] = await pool.execute(
      DATASET_SELECT_QUERY.replace('WHERE d.activo = TRUE', 'WHERE 1=1') + ' AND d.id = ? GROUP BY d.id',
      [id]
    );

    res.json({
      success: true,
      data: rows[0],
      message: 'Dataset actualizado correctamente'
    });
  } catch (error) {
    // Rollback en caso de error
    await connection.rollback();
    connection.release();
    
    console.error('Error actualizando dataset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el dataset'
    });
  }
};

// Eliminar dataset (soft delete)
export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE datasets SET activo = FALSE WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dataset no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Dataset eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando dataset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el dataset'
    });
  }
};

// Obtener estadísticas para el dashboard
export const getEstadisticas = async (req, res) => {
  try {
    const [datasets] = await pool.execute(DATASET_SELECT_QUERY + ' GROUP BY d.id');
    const data = datasets;

    const hoy = new Date();
    let actualizados = 0;
    let proximos = 0;
    let atrasados = 0;      // Gestión interna
    let sinRespuesta = 0;   // Gestión externa
    let totalDiasAtraso = 0;

    data.forEach(d => {
      const estado = calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      if (estado === 'actualizado') actualizados++;
      else if (estado === 'proximo') proximos++;
      else if (estado === 'atrasado') {
        atrasados++;
        if (d.proxima_actualizacion) {
          const proxima = new Date(d.proxima_actualizacion);
          const diasAtraso = Math.floor((hoy.getTime() - proxima.getTime()) / (1000 * 60 * 60 * 24));
          totalDiasAtraso += diasAtraso;
        }
      } else if (estado === 'sin-respuesta') {
        sinRespuesta++;
        if (d.proxima_actualizacion) {
          const proxima = new Date(d.proxima_actualizacion);
          const diasAtraso = Math.floor((hoy.getTime() - proxima.getTime()) / (1000 * 60 * 60 * 24));
          totalDiasAtraso += diasAtraso;
        }
      }
    });

    // Total de vencidos (atrasados + sin respuesta)
    const totalVencidos = atrasados + sinRespuesta;

    // Datasets por tema
    const [porTema] = await pool.execute(`
      SELECT t.nombre AS tema, COUNT(*) AS cantidad
      FROM datasets d
      JOIN temas t ON d.tema_principal_id = t.id
      WHERE d.activo = TRUE
      GROUP BY t.nombre
      ORDER BY cantidad DESC
    `);

    // Datasets por frecuencia
    const [porFrecuencia] = await pool.execute(`
      SELECT f.nombre AS frecuencia, COUNT(*) AS cantidad
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      WHERE d.activo = TRUE
      GROUP BY f.nombre
      ORDER BY f.orden ASC
    `);

    const estadisticas = {
      total: data.length,
      actualizados,
      proximos,
      atrasados,         // Solo gestión interna
      sinRespuesta,      // Solo gestión externa
      totalVencidos,     // Suma de ambos
      tasaActualizacion: data.length > 0 ? Math.round(((actualizados + proximos) / data.length) * 100) : 0,
      promedioAtraso: totalVencidos > 0 ? Math.round(totalDiasAtraso / totalVencidos) : 0,
      porTema,
      porFrecuencia
    };

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las estadísticas'
    });
  }
};

// Registrar actualización de dataset
export const registrarActualizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_actualizacion, notas } = req.body;

    // Obtener el dataset y su frecuencia
    const [datasetRows] = await pool.execute(
      `SELECT d.*, f.dias AS frecuencia_dias 
       FROM datasets d 
       JOIN frecuencias f ON d.frecuencia_id = f.id 
       WHERE d.id = ? AND d.activo = TRUE`,
      [id]
    );

    if (datasetRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dataset no encontrado'
      });
    }

    const dataset = datasetRows[0];
    const fechaActualizacion = fecha_actualizacion || new Date().toISOString().split('T')[0];

    // Calcular próxima actualización si la frecuencia tiene días definidos
    let proximaActualizacion = null;
    if (dataset.frecuencia_dias) {
      const fecha = new Date(fechaActualizacion);
      fecha.setDate(fecha.getDate() + dataset.frecuencia_dias);
      proximaActualizacion = fecha.toISOString().split('T')[0];
    }

    // Actualizar el dataset
    await pool.execute(
      `UPDATE datasets SET 
        ultima_actualizacion = ?, 
        proxima_actualizacion = ? 
       WHERE id = ?`,
      [fechaActualizacion, proximaActualizacion, id]
    );

    // Registrar en historial
    await pool.execute(
      `INSERT INTO historial_actualizaciones (dataset_id, fecha_actualizacion, usuario_id, notas)
       VALUES (?, ?, ?, ?)`,
      [id, fechaActualizacion, req.user?.userId || null, notas || null]
    );

    // Obtener el dataset actualizado
    const [rows] = await pool.execute(
      DATASET_SELECT_QUERY + ' AND d.id = ? GROUP BY d.id',
      [id]
    );

    res.json({
      success: true,
      data: rows[0],
      message: 'Actualización registrada correctamente'
    });
  } catch (error) {
    console.error('Error registrando actualización:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar la actualización'
    });
  }
};
