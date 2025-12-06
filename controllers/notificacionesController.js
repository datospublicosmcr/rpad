import pool from '../config/database.js';
import { sendEmail, verifyConnection } from '../services/emailService.js';
import * as templates from '../services/emailTemplates.js';

/**
 * Obtiene datasets por tipo de gestión y días hasta vencimiento
 * @param {string} tipoGestion - 'interna' o 'externa'
 * @param {number} dias - Días exactos hasta vencimiento (negativo para vencidos)
 * @param {boolean} vencidos - Si es true, busca todos los vencidos (ignora dias)
 */
const getDatasetsByDias = async (tipoGestion, dias, vencidos = false) => {
  let query;
  let params;

  if (vencidos) {
    // Todos los vencidos (proxima_actualizacion < hoy)
    query = `
      SELECT d.titulo, d.area_responsable, d.url_dataset, d.proxima_actualizacion
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      WHERE d.activo = TRUE 
        AND d.tipo_gestion = ?
        AND d.proxima_actualizacion < CURDATE()
        AND f.dias IS NOT NULL
      ORDER BY d.proxima_actualizacion ASC
    `;
    params = [tipoGestion];
  } else {
    // Exactamente X días hasta vencimiento
    query = `
      SELECT d.titulo, d.area_responsable, d.url_dataset, d.proxima_actualizacion
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      WHERE d.activo = TRUE 
        AND d.tipo_gestion = ?
        AND d.proxima_actualizacion = DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND f.dias IS NOT NULL
      ORDER BY d.titulo ASC
    `;
    params = [tipoGestion, dias];
  }

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * Ejecuta el proceso de notificaciones diarias
 * Llamado por cron a las 8:00 AM
 */
export const ejecutarNotificacionesDiarias = async (req, res) => {
  const resultados = {
    fecha: new Date().toISOString(),
    enviados: [],
    errores: [],
    sinDatasets: []
  };

  try {
    const hoy = new Date();
    const esDia1 = hoy.getDate() === 1;

    // =====================================================
    // INTERNOS
    // =====================================================

    // -60 días
    const internos60 = await getDatasetsByDias('interna', 60);
    if (internos60.length > 0) {
      const { subject, html } = templates.interno60dias(internos60);
      const result = await sendEmail({ subject, html });
      if (result.success) {
        resultados.enviados.push({ tipo: 'interno-60', cantidad: internos60.length });
      } else {
        resultados.errores.push({ tipo: 'interno-60', error: result.error });
      }
    } else {
      resultados.sinDatasets.push('interno-60');
    }

    // -30 días
    const internos30 = await getDatasetsByDias('interna', 30);
    if (internos30.length > 0) {
      const { subject, html } = templates.interno30dias(internos30);
      const result = await sendEmail({ subject, html });
      if (result.success) {
        resultados.enviados.push({ tipo: 'interno-30', cantidad: internos30.length });
      } else {
        resultados.errores.push({ tipo: 'interno-30', error: result.error });
      }
    } else {
      resultados.sinDatasets.push('interno-30');
    }

    // Vencidos (solo día 1)
    if (esDia1) {
      const internosVencidos = await getDatasetsByDias('interna', 0, true);
      if (internosVencidos.length > 0) {
        const { subject, html } = templates.internoVencido(internosVencidos);
        const result = await sendEmail({ subject, html });
        if (result.success) {
          resultados.enviados.push({ tipo: 'interno-vencido', cantidad: internosVencidos.length });
        } else {
          resultados.errores.push({ tipo: 'interno-vencido', error: result.error });
        }
      } else {
        resultados.sinDatasets.push('interno-vencido');
      }
    }

    // =====================================================
    // EXTERNOS
    // =====================================================

    // -60 días
    const externos60 = await getDatasetsByDias('externa', 60);
    if (externos60.length > 0) {
      const { subject, html } = templates.externo60dias(externos60);
      const result = await sendEmail({ subject, html });
      if (result.success) {
        resultados.enviados.push({ tipo: 'externo-60', cantidad: externos60.length });
      } else {
        resultados.errores.push({ tipo: 'externo-60', error: result.error });
      }
    } else {
      resultados.sinDatasets.push('externo-60');
    }

    // -40 días
    const externos40 = await getDatasetsByDias('externa', 40);
    if (externos40.length > 0) {
      const { subject, html } = templates.externo40dias(externos40);
      const result = await sendEmail({ subject, html });
      if (result.success) {
        resultados.enviados.push({ tipo: 'externo-40', cantidad: externos40.length });
      } else {
        resultados.errores.push({ tipo: 'externo-40', error: result.error });
      }
    } else {
      resultados.sinDatasets.push('externo-40');
    }

    // -5 días
    const externos5 = await getDatasetsByDias('externa', 5);
    if (externos5.length > 0) {
      const { subject, html } = templates.externo5dias(externos5);
      const result = await sendEmail({ subject, html });
      if (result.success) {
        resultados.enviados.push({ tipo: 'externo-5', cantidad: externos5.length });
      } else {
        resultados.errores.push({ tipo: 'externo-5', error: result.error });
      }
    } else {
      resultados.sinDatasets.push('externo-5');
    }

    // Vencidos (solo día 1)
    if (esDia1) {
      const externosVencidos = await getDatasetsByDias('externa', 0, true);
      if (externosVencidos.length > 0) {
        const { subject, html } = templates.externoVencido(externosVencidos);
        const result = await sendEmail({ subject, html });
        if (result.success) {
          resultados.enviados.push({ tipo: 'externo-vencido', cantidad: externosVencidos.length });
        } else {
          resultados.errores.push({ tipo: 'externo-vencido', error: result.error });
        }
      } else {
        resultados.sinDatasets.push('externo-vencido');
      }
    }

    // Respuesta
    const success = resultados.errores.length === 0;
    res.status(success ? 200 : 207).json({
      success,
      message: success 
        ? `Proceso completado. ${resultados.enviados.length} emails enviados.`
        : `Proceso completado con ${resultados.errores.length} errores.`,
      data: resultados
    });

  } catch (error) {
    console.error('Error en notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error ejecutando notificaciones',
      details: error.message
    });
  }
};

/**
 * Endpoint de prueba para enviar un tipo específico de notificación
 * Útil para testear sin esperar al cron
 */
export const pruebaNotificacion = async (req, res) => {
  const { tipo } = req.params;
  
  // Mapeo de tipos válidos
  const tiposValidos = {
    'interno-60': { tipoGestion: 'interna', dias: 60, template: templates.interno60dias },
    'interno-30': { tipoGestion: 'interna', dias: 30, template: templates.interno30dias },
    'interno-vencido': { tipoGestion: 'interna', vencidos: true, template: templates.internoVencido },
    'externo-60': { tipoGestion: 'externa', dias: 60, template: templates.externo60dias },
    'externo-40': { tipoGestion: 'externa', dias: 40, template: templates.externo40dias },
    'externo-5': { tipoGestion: 'externa', dias: 5, template: templates.externo5dias },
    'externo-vencido': { tipoGestion: 'externa', vencidos: true, template: templates.externoVencido }
  };

  if (!tiposValidos[tipo]) {
    return res.status(400).json({
      success: false,
      error: 'Tipo no válido',
      tiposDisponibles: Object.keys(tiposValidos)
    });
  }

  try {
    const config = tiposValidos[tipo];
    const datasets = await getDatasetsByDias(
      config.tipoGestion, 
      config.dias || 0, 
      config.vencidos || false
    );

    if (datasets.length === 0) {
      return res.json({
        success: true,
        message: 'No hay datasets que cumplan los criterios',
        tipo,
        datasetsEncontrados: 0
      });
    }

    const { subject, html } = config.template(datasets);
    const result = await sendEmail({ subject, html });

    res.json({
      success: result.success,
      message: result.success ? 'Email de prueba enviado' : 'Error enviando email',
      tipo,
      datasetsEncontrados: datasets.length,
      datasets: datasets.map(d => d.titulo),
      ...(result.error && { error: result.error })
    });

  } catch (error) {
    console.error('Error en prueba:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Verifica la conexión SMTP
 */
export const verificarSMTP = async (req, res) => {
  const result = await verifyConnection();
  res.json({
    success: result.success,
    message: result.success ? 'Conexión SMTP verificada' : 'Error conectando a SMTP',
    error: result.error || null,
    code: result.code || null
  });
};

/**
 * Preview de email (sin enviar)
 * Devuelve el HTML para visualizar
 */
export const previewEmail = async (req, res) => {
  const { tipo } = req.params;
  
  const tiposValidos = {
    'interno-60': { tipoGestion: 'interna', dias: 60, template: templates.interno60dias },
    'interno-30': { tipoGestion: 'interna', dias: 30, template: templates.interno30dias },
    'interno-vencido': { tipoGestion: 'interna', vencidos: true, template: templates.internoVencido },
    'externo-60': { tipoGestion: 'externa', dias: 60, template: templates.externo60dias },
    'externo-40': { tipoGestion: 'externa', dias: 40, template: templates.externo40dias },
    'externo-5': { tipoGestion: 'externa', dias: 5, template: templates.externo5dias },
    'externo-vencido': { tipoGestion: 'externa', vencidos: true, template: templates.externoVencido }
  };

  if (!tiposValidos[tipo]) {
    return res.status(400).json({
      success: false,
      error: 'Tipo no válido',
      tiposDisponibles: Object.keys(tiposValidos)
    });
  }

  try {
    const config = tiposValidos[tipo];
    let datasets = await getDatasetsByDias(
      config.tipoGestion, 
      config.dias || 0, 
      config.vencidos || false
    );

    // Si no hay datasets reales, usar datos de ejemplo
    if (datasets.length === 0) {
      datasets = [
        {
          titulo: 'Dataset de Ejemplo 1',
          area_responsable: 'Área de Ejemplo',
          url_dataset: 'https://datos.comodoro.gov.ar/dataset/ejemplo'
        },
        {
          titulo: 'Dataset de Ejemplo 2',
          area_responsable: 'Otra Área de Ejemplo',
          url_dataset: 'https://datos.comodoro.gov.ar/dataset/ejemplo-2'
        }
      ];
    }

    const { subject, html } = config.template(datasets);

    // Devolver HTML para previsualizar en el navegador
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
