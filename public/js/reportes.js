/**
 * Reportes - RPAD
 * Lógica para generación de reportes PDF
 */

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar nombre de usuario
  const user = Auth.getUser();
  document.getElementById('user-name').textContent = user?.nombre || '';

  // Cargar áreas para el select
  await cargarAreas();

  // Establecer fechas por defecto para historial
  const hoy = new Date();
  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 30);
  
  document.getElementById('historial-hasta').value = hoy.toISOString().split('T')[0];
  document.getElementById('historial-desde').value = hace30Dias.toISOString().split('T')[0];
});

/**
 * Cargar áreas en el select
 */
async function cargarAreas() {
  try {
    const areas = await API.getAreas();
    const select = document.getElementById('area-select');
    
    select.innerHTML = '<option value="">Seleccionar área...</option>';
    
    // Ordenar alfabéticamente
    areas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    areas.forEach(area => {
      const option = document.createElement('option');
      option.value = area.id;
      option.textContent = area.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando áreas:', error);
    Utils.showError('Error al cargar las áreas');
  }
}

/**
 * Generar reporte de estado general
 */
function generarReporteEstadoGeneral() {
  const url = API.getReporteEstadoGeneralUrl();
  descargarPDF(url, 'estado-general');
}

/**
 * Generar reporte de historial de notificaciones
 */
function generarReporteHistorial() {
  const desde = document.getElementById('historial-desde').value;
  const hasta = document.getElementById('historial-hasta').value;
  
  const url = API.getReporteHistorialUrl(desde, hasta);
  descargarPDF(url, 'historial-notificaciones');
}

/**
 * Generar reporte por área
 */
function generarReportePorArea() {
  const areaId = document.getElementById('area-select').value;
  
  if (!areaId) {
    Utils.showError('Por favor seleccione un área');
    return;
  }
  
  const url = API.getReportePorAreaUrl(areaId);
  descargarPDF(url, `reporte-area-${areaId}`);
}

/**
 * Generar reporte de cumplimiento
 */
function generarReporteCumplimiento() {
  const periodo = document.getElementById('periodo-select').value;
  const url = API.getReporteCumplimientoUrl(periodo);
  descargarPDF(url, `cumplimiento-${periodo}`);
}

/**
 * Descargar PDF desde URL
 */
async function descargarPDF(url, nombre) {
  try {
    // Mostrar loading
    Utils.showSuccess('Generando reporte...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: Auth.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al generar el reporte');
    }
    
    // Obtener el blob del PDF
    const blob = await response.blob();
    
    // Crear link de descarga
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${nombre}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    
    Utils.showSuccess('Reporte generado exitosamente');
    
  } catch (error) {
    console.error('Error generando reporte:', error);
    Utils.showError(error.message || 'Error al generar el reporte');
  }
}
