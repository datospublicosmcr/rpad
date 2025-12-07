import PDFDocument from 'pdfkit';
import pool from '../config/database.js';

// Colores institucionales
const COLORS = {
  primary: '#0066cc',
  primaryDark: '#1a365d',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  sinRespuesta: '#ff9800',
  gray: '#6b7280',
  grayLight: '#f3f4f6',
  grayDark: '#374151',
  white: '#ffffff'
};

/**
 * Formatea fecha a formato argentino
 */
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea fecha y hora
 */
const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcula el estado del dataset
 */
const calcularEstado = (proximaActualizacion, frecuenciaDias, tipoGestion) => {
  if (frecuenciaDias === null) return 'actualizado';
  if (!proximaActualizacion) return 'sin-fecha';

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proxima = new Date(proximaActualizacion);
  proxima.setHours(0, 0, 0, 0);

  const diffDias = Math.floor((proxima - hoy) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    return tipoGestion === 'interna' ? 'atrasado' : 'sin-respuesta';
  }
  if (diffDias <= 60) return 'proximo';
  return 'actualizado';
};

/**
 * Obtiene texto del estado
 */
const getEstadoTexto = (estado) => {
  const textos = {
    'actualizado': 'Actualizado',
    'proximo': 'Próximo a vencer',
    'atrasado': 'Atrasado',
    'sin-respuesta': 'Sin respuesta',
    'sin-fecha': 'Sin fecha'
  };
  return textos[estado] || estado;
};

/**
 * Obtiene color del estado
 */
const getEstadoColor = (estado) => {
  const colores = {
    'actualizado': COLORS.success,
    'proximo': COLORS.warning,
    'atrasado': COLORS.danger,
    'sin-respuesta': COLORS.sinRespuesta,
    'sin-fecha': COLORS.gray
  };
  return colores[estado] || COLORS.gray;
};

/**
 * Dibuja el header del PDF
 */
const drawHeader = (doc, titulo, subtitulo = null) => {
  // Banda azul superior
  doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primaryDark);
  
  // Título
  doc.fillColor(COLORS.white)
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('RPAD - ' + titulo, 40, 25);
  
  // Subtítulo
  if (subtitulo) {
    doc.fontSize(10)
       .font('Helvetica')
       .text(subtitulo, 40, 50);
  }
  
  // Fecha de generación
  doc.fontSize(9)
     .text(`Generado: ${formatDateTime(new Date())}`, 40, 50 + (subtitulo ? 15 : 0));
  
  doc.fillColor(COLORS.grayDark);
  doc.y = 100;
};

/**
 * Dibuja el footer del PDF
 */
const drawFooter = (doc, pageNum) => {
  const y = doc.page.height - 40;
  
  // Calcular posición centrada manualmente
  const texto = 'Dirección de Datos Públicos y Comunicación - Municipalidad de Comodoro Rivadavia';
  const textoWidth = doc.widthOfString(texto, { fontSize: 8 });
  const centerX = (doc.page.width - textoWidth) / 2;
  
  doc.fontSize(8)
     .fillColor(COLORS.gray)
     .text(texto, centerX, y, { lineBreak: false });
  
  doc.text(`Página ${pageNum}`, doc.page.width - 80, y, { lineBreak: false });
};

/**
 * Dibuja footers en todas las páginas del documento
 */
const drawAllFooters = (doc) => {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    drawFooter(doc, i + 1);
  }
};

/**
 * Dibuja una tarjeta de estadística
 */
const drawStatCard = (doc, x, y, label, value, color) => {
  const width = 120;
  const height = 60;
  
  // Fondo
  doc.rect(x, y, width, height).fill(COLORS.grayLight);
  
  // Barra superior de color
  doc.rect(x, y, width, 4).fill(color);
  
  // Valor
  doc.fillColor(COLORS.grayDark)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(value.toString(), x + 10, y + 15, { width: width - 20 });
  
  // Label
  doc.fillColor(COLORS.gray)
     .fontSize(9)
     .font('Helvetica')
     .text(label, x + 10, y + 42, { width: width - 20 });
};

/**
 * Dibuja una tabla
 */
const drawTable = (doc, headers, rows, startY, colWidths) => {
  const startX = 40;
  const rowHeight = 20;
  const headerHeight = 25;
  let y = startY;
  
  // Header
  doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), headerHeight)
     .fill(COLORS.primaryDark);
  
  let x = startX;
  doc.fillColor(COLORS.white).fontSize(9).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, x + 5, y + 7, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });
  
  y += headerHeight;
  
  // Rows
  doc.font('Helvetica').fontSize(8);
  rows.forEach((row, rowIndex) => {
    // Check page break
    if (y + rowHeight > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
    
    // Alternating background
    if (rowIndex % 2 === 0) {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
         .fill(COLORS.grayLight);
    }
    
    x = startX;
    doc.fillColor(COLORS.grayDark);
    row.forEach((cell, i) => {
      const cellText = cell?.toString() || '-';
      doc.text(cellText, x + 5, y + 5, { width: colWidths[i] - 10, height: rowHeight - 5, ellipsis: true });
      x += colWidths[i];
    });
    
    y += rowHeight;
  });
  
  return y;
};

// =====================================================
// REPORTE: Estado General de Datasets
// =====================================================
export const reporteEstadoGeneral = async (req, res) => {
  try {
    // Obtener datos
    const [datasets] = await pool.execute(`
      SELECT d.*, f.nombre AS frecuencia_nombre, f.dias AS frecuencia_dias,
             a.nombre AS area_nombre, t.nombre AS tema_nombre
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      JOIN areas a ON d.area_id = a.id
      JOIN temas t ON d.tema_principal_id = t.id
      WHERE d.activo = TRUE
      ORDER BY d.proxima_actualizacion ASC
    `);
    
    // Calcular estadísticas
    const stats = { total: datasets.length, actualizados: 0, proximos: 0, atrasados: 0, sinRespuesta: 0 };
    datasets.forEach(d => {
      const estado = calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      d.estado = estado;
      if (estado === 'actualizado') stats.actualizados++;
      else if (estado === 'proximo') stats.proximos++;
      else if (estado === 'atrasado') stats.atrasados++;
      else if (estado === 'sin-respuesta') stats.sinRespuesta++;
    });
    
    const tasaActualizacion = stats.total > 0 ? Math.round((stats.actualizados / stats.total) * 100) : 0;
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estado-general-${formatDate(new Date()).replace(/\//g, '-')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    drawHeader(doc, 'Estado General de Datasets', 'Registro Permanente de Actualización de Datos');
    
    // Estadísticas
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.grayDark).text('Resumen', 40, doc.y + 10);
    doc.y += 25;
    
    const statsY = doc.y;
    drawStatCard(doc, 40, statsY, 'Total Datasets', stats.total, COLORS.primary);
    drawStatCard(doc, 170, statsY, 'Actualizados', stats.actualizados, COLORS.success);
    drawStatCard(doc, 300, statsY, 'Próximos', stats.proximos, COLORS.warning);
    drawStatCard(doc, 430, statsY, 'Vencidos', stats.atrasados + stats.sinRespuesta, COLORS.danger);
    
    doc.y = statsY + 80;
    
    // Tasa de actualización
    doc.fontSize(11).font('Helvetica')
       .text(`Tasa de actualización: ${tasaActualizacion}%`, 40, doc.y);
    
    doc.y += 30;
    
    // Tabla de datasets
    doc.fontSize(12).font('Helvetica-Bold').text('Detalle de Datasets', 40, doc.y);
    doc.y += 15;
    
    const headers = ['Título', 'Área', 'Frecuencia', 'Próx. Act.', 'Estado'];
    const colWidths = [180, 130, 70, 70, 65];
    
    const rows = datasets.map(d => [
      d.titulo,
      d.area_nombre,
      d.frecuencia_nombre,
      formatDate(d.proxima_actualizacion),
      getEstadoTexto(d.estado)
    ]);
    
    drawTable(doc, headers, rows, doc.y, colWidths);
    
    // Footer
    drawAllFooters(doc);
    
    doc.end();
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// =====================================================
// REPORTE: Historial de Notificaciones
// =====================================================

/**
 * Obtiene texto descriptivo del tipo de notificación
 */
const getTipoNotificacionTexto = (tipo) => {
  const textos = {
    'interno-60': 'Aviso interno - 60 días',
    'interno-30': 'Aviso interno - 30 días',
    'interno-vencido': 'Aviso interno - Vencido',
    'externo-60': 'Aviso externo - 60 días',
    'externo-40': 'Aviso externo - 40 días',
    'externo-5': 'Aviso externo - 5 días',
    'externo-vencido': 'Aviso externo - Vencido',
    'area-aviso-40': 'Aviso a área - 40 días'
  };
  return textos[tipo] || tipo;
};

/**
 * Dibuja una tarjeta de notificación
 */
const drawNotificacionCard = (doc, notificacion, datasetsTitulos, startY) => {
  const cardX = 40;
  const cardWidth = doc.page.width - 80;
  const padding = 12;
  const lineHeight = 14;
  
  // Preparar textos
  const fechaTipo = `${formatDateTime(notificacion.enviado_at)} - ${getTipoNotificacionTexto(notificacion.tipo)}`;
  const area = notificacion.area_nombre || 'DGMIT (Gestión interna)';
  const datasetsTexto = datasetsTitulos.length > 0 
    ? `${notificacion.cantidad_datasets} dataset(s): ${datasetsTitulos.join(', ')}`
    : `${notificacion.cantidad_datasets} dataset(s)`;
  const destinatarios = notificacion.destinatarios || 'Sin destinatarios';
  const estado = notificacion.success ? 'Enviado correctamente' : `Error: ${notificacion.error_message || 'Desconocido'}`;
  
  // Calcular alturas
  doc.fontSize(9);
  const datasetsHeight = Math.min(doc.heightOfString(datasetsTexto, { width: cardWidth - (padding * 2) }), lineHeight * 2);
  const destinatariosHeight = Math.min(doc.heightOfString(destinatarios, { width: cardWidth - (padding * 2) }), lineHeight * 2);
  
  // Altura total de la tarjeta
  const cardHeight = padding + 16 + 14 + datasetsHeight + destinatariosHeight + 14 + padding;
  
  // Verificar salto de página
  if (startY + cardHeight > doc.page.height - 60) {
    doc.addPage();
    startY = 40;
  }
  
  // Fondo de la tarjeta
  doc.rect(cardX, startY, cardWidth, cardHeight)
     .fill(COLORS.grayLight);
  
  // Barra lateral de color según éxito/error
  const statusColor = notificacion.success ? COLORS.success : COLORS.danger;
  doc.rect(cardX, startY, 4, cardHeight).fill(statusColor);
  
  let currentY = startY + padding;
  
  // Línea 1: Fecha y hora + Tipo (bold)
  doc.fillColor(COLORS.grayDark)
     .fontSize(10)
     .font('Helvetica-Bold')
     .text(fechaTipo, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2), 
       lineBreak: false,
       ellipsis: true 
     });
  currentY += 16;
  
  // Línea 2: Área destinataria
  doc.fillColor(COLORS.primary)
     .fontSize(9)
     .font('Helvetica')
     .text(`Area: ${area}`, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2), 
       lineBreak: false,
       ellipsis: true 
     });
  currentY += 14;
  
  // Línea 3: Datasets
  doc.fillColor(COLORS.grayDark)
     .fontSize(8)
     .font('Helvetica')
     .text(datasetsTexto, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2),
       height: datasetsHeight,
       ellipsis: true
     });
  currentY += datasetsHeight + 2;
  
  // Línea 4: Destinatarios
  doc.fillColor(COLORS.gray)
     .fontSize(8)
     .font('Helvetica')
     .text(`Enviado a: ${destinatarios}`, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2),
       height: destinatariosHeight,
       ellipsis: true
     });
  currentY += destinatariosHeight + 2;
  
  // Línea 5: Estado
  const estadoColor = notificacion.success ? COLORS.success : COLORS.danger;
  doc.fillColor(estadoColor)
     .fontSize(8)
     .font('Helvetica-Bold')
     .text(estado, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2),
       lineBreak: false
     });
  
  return startY + cardHeight + 8;
};

export const reporteHistorialNotificaciones = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let whereClause = '';
    const params = [];
    
    if (desde) {
      whereClause += ' AND n.enviado_at >= ?';
      params.push(desde);
    }
    if (hasta) {
      whereClause += ' AND n.enviado_at <= ?';
      params.push(hasta + ' 23:59:59');
    }
    
    const [notificaciones] = await pool.execute(`
      SELECT n.*, a.nombre AS area_nombre
      FROM notificaciones_log n
      LEFT JOIN areas a ON n.area_id = a.id
      WHERE 1=1 ${whereClause}
      ORDER BY n.enviado_at DESC
    `, params);
    
    // Obtener todos los IDs de datasets únicos
    const allDatasetIds = new Set();
    notificaciones.forEach(n => {
      if (n.datasets_ids) {
        n.datasets_ids.split(',').forEach(id => allDatasetIds.add(id.trim()));
      }
    });
    
    // Obtener títulos de datasets
    let datasetsTitulosMap = {};
    if (allDatasetIds.size > 0) {
      const idsArray = Array.from(allDatasetIds);
      const placeholders = idsArray.map(() => '?').join(',');
      const [datasets] = await pool.execute(
        `SELECT id, titulo FROM datasets WHERE id IN (${placeholders})`,
        idsArray
      );
      datasets.forEach(d => {
        datasetsTitulosMap[d.id] = d.titulo;
      });
    }
    
    // Estadísticas por tipo
    const porTipo = {};
    let exitosas = 0, fallidas = 0;
    notificaciones.forEach(n => {
      porTipo[n.tipo] = (porTipo[n.tipo] || 0) + 1;
      if (n.success) exitosas++;
      else fallidas++;
    });
    
    const fechaDesde = desde ? formatDate(desde) : 'Inicio';
    const fechaHasta = hasta ? formatDate(hasta) : 'Hoy';
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=historial-notificaciones-${formatDate(new Date()).replace(/\//g, '-')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    drawHeader(doc, 'Historial de Notificaciones', `Período: ${fechaDesde} - ${fechaHasta}`);
    
    // Resumen
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.grayDark).text('Resumen', 40, doc.y + 10);
    doc.y += 25;
    
    const statsY = doc.y;
    drawStatCard(doc, 40, statsY, 'Total Enviadas', notificaciones.length, COLORS.primary);
    drawStatCard(doc, 170, statsY, 'Exitosas', exitosas, COLORS.success);
    drawStatCard(doc, 300, statsY, 'Fallidas', fallidas, COLORS.danger);
    
    doc.y = statsY + 80;
    
    // Desglose por tipo
    doc.fontSize(11).font('Helvetica-Bold').text('Desglose por tipo:', 40, doc.y);
    doc.y += 15;
    doc.font('Helvetica').fontSize(10);
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      doc.text(`${getTipoNotificacionTexto(tipo)}: ${cantidad}`, 50, doc.y);
      doc.y += 15;
    });
    
    doc.y += 20;
    
    // Detalle de Notificaciones con tarjetas
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.grayDark).text('Detalle de Notificaciones', 40, doc.y);
    doc.y += 20;
    
    let currentY = doc.y;
    
    notificaciones.forEach(n => {
      // Obtener títulos de datasets para esta notificación
      const datasetsTitulos = [];
      if (n.datasets_ids) {
        n.datasets_ids.split(',').forEach(id => {
          const titulo = datasetsTitulosMap[id.trim()];
          if (titulo) datasetsTitulos.push(titulo);
        });
      }
      
      currentY = drawNotificacionCard(doc, n, datasetsTitulos, currentY);
    });
    
    // Footer
    drawAllFooters(doc);
    
    doc.end();
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// =====================================================
// REPORTE: Por Área Específica
// =====================================================

/**
 * Dibuja una tarjeta de dataset
 */
const drawDatasetCard = (doc, dataset, startY) => {
  const cardX = 40;
  const cardWidth = doc.page.width - 80;
  const padding = 12;
  const lineHeight = 14;
  
  // Calcular altura necesaria para la descripción (máximo 3 líneas)
  doc.fontSize(9);
  const descripcionCorta = dataset.descripcion ? 
    (dataset.descripcion.length > 300 ? dataset.descripcion.substring(0, 300) + '...' : dataset.descripcion) : 
    'Sin descripción';
  const descripcionHeight = doc.heightOfString(descripcionCorta, { width: cardWidth - (padding * 2), lineGap: 2 });
  const descHeight = Math.min(descripcionHeight, lineHeight * 4); // Máximo 4 líneas
  
  // Altura total de la tarjeta
  const cardHeight = padding + 18 + 14 + descHeight + 14 + padding;
  
  // Verificar salto de página
  if (startY + cardHeight > doc.page.height - 60) {
    doc.addPage();
    startY = 40;
  }
  
  // Fondo de la tarjeta
  doc.rect(cardX, startY, cardWidth, cardHeight)
     .fill(COLORS.grayLight);
  
  // Barra lateral de color según estado
  const estadoColor = getEstadoColor(dataset.estado);
  doc.rect(cardX, startY, 4, cardHeight).fill(estadoColor);
  
  let currentY = startY + padding;
  
  // Línea 1: Título
  doc.fillColor(COLORS.grayDark)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text(dataset.titulo, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2), 
       lineBreak: false,
       ellipsis: true 
     });
  currentY += 18;
  
  // Línea 2: Temas
  const temas = dataset.tema_secundario_nombre ? 
    `${dataset.tema_nombre} · ${dataset.tema_secundario_nombre}` : 
    dataset.tema_nombre;
  doc.fillColor(COLORS.primary)
     .fontSize(9)
     .font('Helvetica')
     .text(temas, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2), 
       lineBreak: false,
       ellipsis: true 
     });
  currentY += 14;
  
  // Línea 3: Descripción
  doc.fillColor(COLORS.gray)
     .fontSize(9)
     .font('Helvetica')
     .text(descripcionCorta, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2),
       height: descHeight,
       ellipsis: true,
       lineGap: 2
     });
  currentY += descHeight + 4;
  
  // Línea 4: Fecha y frecuencia
  const fechaTexto = dataset.proxima_actualizacion ? 
    `Proxima actualizacion: ${formatDate(dataset.proxima_actualizacion)}` : 
    'Sin fecha programada';
  const frecuenciaTexto = `Frecuencia de actualizacion: ${dataset.frecuencia_nombre}`;
  
  doc.fillColor(COLORS.grayDark)
     .fontSize(8)
     .font('Helvetica')
     .text(`${fechaTexto}     ${frecuenciaTexto}`, cardX + padding, currentY, { 
       width: cardWidth - (padding * 2),
       lineBreak: false 
     });
  
  return startY + cardHeight + 8; // Retorna Y para la siguiente tarjeta
};

/**
 * Dibuja un grupo de datasets con título de sección
 */
const drawDatasetGroup = (doc, titulo, datasets, color, startY) => {
  if (datasets.length === 0) return startY;
  
  // Verificar salto de página para el título
  if (startY + 30 > doc.page.height - 60) {
    doc.addPage();
    startY = 40;
  }
  
  // Título de la sección
  doc.rect(40, startY, 4, 20).fill(color);
  doc.fillColor(COLORS.grayDark)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(`${titulo} (${datasets.length})`, 52, startY + 4, { lineBreak: false });
  
  startY += 30;
  
  // Dibujar cada tarjeta
  datasets.forEach(dataset => {
    startY = drawDatasetCard(doc, dataset, startY);
  });
  
  return startY + 10; // Espacio extra entre grupos
};

export const reportePorArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    
    // Obtener área
    const [areas] = await pool.execute('SELECT * FROM areas WHERE id = ?', [areaId]);
    if (areas.length === 0) {
      return res.status(404).json({ success: false, error: 'Área no encontrada' });
    }
    const area = areas[0];
    
    // Obtener datasets del área con tema secundario
    const [datasets] = await pool.execute(`
      SELECT d.*, f.nombre AS frecuencia_nombre, f.dias AS frecuencia_dias,
             t1.nombre AS tema_nombre, t2.nombre AS tema_secundario_nombre
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      JOIN temas t1 ON d.tema_principal_id = t1.id
      LEFT JOIN temas t2 ON d.tema_secundario_id = t2.id
      WHERE d.area_id = ? AND d.activo = TRUE
      ORDER BY d.proxima_actualizacion ASC
    `, [areaId]);
    
    // Calcular estadísticas y agrupar por estado
    const stats = { total: datasets.length, actualizados: 0, proximos: 0, vencidos: 0 };
    const grupos = { actualizados: [], proximos: [], vencidos: [] };
    
    datasets.forEach(d => {
      const estado = calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      d.estado = estado;
      
      if (estado === 'actualizado') {
        stats.actualizados++;
        grupos.actualizados.push(d);
      } else if (estado === 'proximo') {
        stats.proximos++;
        grupos.proximos.push(d);
      } else {
        stats.vencidos++;
        grupos.vencidos.push(d);
      }
    });
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-area-${areaId}-${formatDate(new Date()).replace(/\//g, '-')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    drawHeader(doc, 'Reporte por Área', area.nombre);
    
    // Información del área
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.grayDark).text('Datos del Área', 40, doc.y + 10);
    doc.y += 20;
    doc.fontSize(10).font('Helvetica');
    if (area.area_superior) doc.text(`Área Superior: ${area.area_superior}`, 40, doc.y); doc.y += 15;
    if (area.email_principal) doc.text(`Email: ${area.email_principal}`, 40, doc.y); doc.y += 15;
    if (area.nombre_contacto) doc.text(`Contacto: ${area.nombre_contacto}`, 40, doc.y); doc.y += 15;
    
    doc.y += 15;
    
    // Estadísticas
    const statsY = doc.y;
    drawStatCard(doc, 40, statsY, 'Total Datasets', stats.total, COLORS.primary);
    drawStatCard(doc, 170, statsY, 'Actualizados', stats.actualizados, COLORS.success);
    drawStatCard(doc, 300, statsY, 'Próximos', stats.proximos, COLORS.warning);
    drawStatCard(doc, 430, statsY, 'Vencidos', stats.vencidos, COLORS.danger);
    
    let currentY = statsY + 90;
    
    // Dibujar grupos de datasets como tarjetas
    currentY = drawDatasetGroup(doc, 'Vencidos', grupos.vencidos, COLORS.danger, currentY);
    currentY = drawDatasetGroup(doc, 'Próximos a vencer', grupos.proximos, COLORS.warning, currentY);
    currentY = drawDatasetGroup(doc, 'Actualizados', grupos.actualizados, COLORS.success, currentY);
    
    // Footer
    drawAllFooters(doc);
    
    doc.end();
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// =====================================================
// REPORTE: Cumplimiento por Período
// =====================================================
export const reporteCumplimiento = async (req, res) => {
  try {
    const { periodo } = req.query; // 'mensual' o 'trimestral'
    
    // Determinar fechas según período
    const hoy = new Date();
    let fechaInicio;
    let tituloPerido;
    
    if (periodo === 'trimestral') {
      const trimestre = Math.floor(hoy.getMonth() / 3);
      fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1);
      tituloPerido = `Trimestre ${trimestre + 1} - ${hoy.getFullYear()}`;
    } else {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      tituloPerido = hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    }
    
    // Obtener datasets y calcular cumplimiento
    const [datasets] = await pool.execute(`
      SELECT d.*, f.nombre AS frecuencia_nombre, f.dias AS frecuencia_dias,
             a.nombre AS area_nombre
      FROM datasets d
      JOIN frecuencias f ON d.frecuencia_id = f.id
      JOIN areas a ON d.area_id = a.id
      WHERE d.activo = TRUE
    `);
    
    // Agrupar por área
    const porArea = {};
    datasets.forEach(d => {
      if (!porArea[d.area_nombre]) {
        porArea[d.area_nombre] = { total: 0, actualizados: 0 };
      }
      porArea[d.area_nombre].total++;
      const estado = calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      if (estado === 'actualizado') porArea[d.area_nombre].actualizados++;
    });
    
    // Calcular porcentaje por área
    const areasConPorcentaje = Object.entries(porArea).map(([nombre, stats]) => ({
      nombre,
      total: stats.total,
      actualizados: stats.actualizados,
      porcentaje: stats.total > 0 ? Math.round((stats.actualizados / stats.total) * 100) : 0
    })).sort((a, b) => b.porcentaje - a.porcentaje);
    
    // Crear PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cumplimiento-${formatDate(new Date()).replace(/\//g, '-')}.pdf`);
    
    doc.pipe(res);
    
    // Header
    drawHeader(doc, 'Reporte de Cumplimiento', tituloPerido);
    
    // Resumen general
    const totalDatasets = datasets.length;
    const totalActualizados = datasets.filter(d => 
      calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion) === 'actualizado'
    ).length;
    const porcentajeGeneral = totalDatasets > 0 ? Math.round((totalActualizados / totalDatasets) * 100) : 0;
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.grayDark).text('Cumplimiento General', 40, doc.y + 10);
    doc.y += 25;
    
    drawStatCard(doc, 40, doc.y, 'Total Datasets', totalDatasets, COLORS.primary);
    drawStatCard(doc, 170, doc.y, 'Actualizados', totalActualizados, COLORS.success);
    drawStatCard(doc, 300, doc.y, '% Cumplimiento', porcentajeGeneral + '%', porcentajeGeneral >= 70 ? COLORS.success : (porcentajeGeneral >= 40 ? COLORS.warning : COLORS.danger));
    
    doc.y += 90;
    
    // Tabla por área
    doc.fontSize(12).font('Helvetica-Bold').text('Cumplimiento por Área', 40, doc.y);
    doc.y += 15;
    
    const headers = ['Área', 'Total', 'Actualizados', 'Cumplimiento'];
    const colWidths = [280, 70, 80, 85];
    
    const rows = areasConPorcentaje.map(a => [
      a.nombre,
      a.total.toString(),
      a.actualizados.toString(),
      a.porcentaje + '%'
    ]);
    
    drawTable(doc, headers, rows, doc.y, colWidths);
    
    // Footer
    drawAllFooters(doc);
    
    doc.end();
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
