/**
 * RPAD - Gestión (Métricas y Proyectos)
 */

let chartActualizados = null;
let chartNotificaciones = null;
let chartTemas = null;
let chartFrecuencias = null;
let editandoProyectoId = null;
let editandoHitoId = null;
let proyectoDetalleId = null;
let vistaActual = 'lista';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const TIPO_METRICA_LABELS = {
  notas_enviadas: 'Notas enviadas',
  reuniones_capacitaciones: 'Reuniones/Capacitaciones',
  consultas_atendidas: 'Consultas atendidas'
};

const ESTADO_LABELS = {
  en_curso: 'En curso',
  completado: 'Completado',
  suspendido: 'Suspendido',
  idea: 'Idea'
};

const CATEGORIA_LABELS = {
  tecnologia: 'Tecnología',
  normativa: 'Normativa',
  difusion: 'Difusión'
};

const PRIORIDAD_LABELS = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar controles admin
  if (Auth.isAdmin()) {
    const metricasSection = document.getElementById('metricas-manuales-section');
    if (metricasSection) metricasSection.style.display = '';
    const btnNuevo = document.getElementById('btn-nuevo-proyecto');
    if (btnNuevo) btnNuevo.style.display = '';
  }

  // Setear año/mes actuales en el form de métricas manuales
  const now = new Date();
  const anioInput = document.getElementById('metrica-anio');
  const mesSelect = document.getElementById('metrica-mes');
  if (anioInput) anioInput.value = now.getFullYear();
  if (mesSelect) mesSelect.value = now.getMonth() + 1;

  await cargarMetricas();
  await cargarAreasSelect();
});

// =====================================================
// TABS
// =====================================================

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');

  if (tab === 'proyectos') {
    cargarProyectos();
  }
}

// =====================================================
// MÉTRICAS AUTOMÁTICAS
// =====================================================

async function cargarMetricas() {
  try {
    const meses = document.getElementById('metricas-periodo').value;
    const response = await fetch(`${CONFIG.API_URL}/gestion/metricas?meses=${meses}`, {
      headers: Auth.getAuthHeaders(),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    const data = result.data;
    renderKPIs(data);
    renderCharts(data);
    renderRanking(data.ranking_areas);
    await cargarMetricasManuales();
  } catch (error) {
    console.error('Error cargando métricas:', error);
    Utils.showError('Error al cargar métricas');
  }
}

function renderKPIs(data) {
  const grid = document.getElementById('kpi-grid');
  const totalActualizados = data.actualizados_por_mes.reduce((s, r) => s + r.cantidad, 0);
  const totalCreados = data.creados_por_mes.reduce((s, r) => s + r.cantidad, 0);
  const totalNotificaciones = data.notificaciones_por_mes.reduce((s, r) => s + r.cantidad, 0);
  const tiempoAprobacion = data.tiempo_promedio_aprobacion ? Math.round(data.tiempo_promedio_aprobacion * 10) / 10 : '-';
  const operador = data.operador_mas_activo ? data.operador_mas_activo.nombre_completo : '-';

  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-value">${totalActualizados}</div>
      <div class="kpi-label">Datasets actualizados</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${totalCreados}</div>
      <div class="kpi-label">Datasets creados</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${totalNotificaciones}</div>
      <div class="kpi-label">Notificaciones enviadas</div>
    </div>
    <div class="kpi-card success">
      <div class="kpi-value">${data.tasa_cumplimiento}%</div>
      <div class="kpi-label">Tasa de cumplimiento</div>
    </div>
    <div class="kpi-card warning">
      <div class="kpi-value">${tiempoAprobacion}</div>
      <div class="kpi-label">Días prom. aprobación</div>
    </div>
  `;
}

function renderCharts(data) {
  // Actualizados por mes
  const actLabels = data.actualizados_por_mes.map(r => `${MESES[r.mes - 1]} ${r.anio}`);
  const actData = data.actualizados_por_mes.map(r => r.cantidad);
  renderBarChart('chart-actualizados', actLabels, actData, '#3b82f6', chartActualizados, c => { chartActualizados = c; });

  // Notificaciones por mes
  const notLabels = data.notificaciones_por_mes.map(r => `${MESES[r.mes - 1]} ${r.anio}`);
  const notData = data.notificaciones_por_mes.map(r => r.cantidad);
  renderBarChart('chart-notificaciones', notLabels, notData, '#10b981', chartNotificaciones, c => { chartNotificaciones = c; });

  // Distribución por tema
  const temaLabels = data.distribucion_por_tema.map(r => r.tema);
  const temaData = data.distribucion_por_tema.map(r => r.cantidad);
  renderDoughnutChart('chart-temas', temaLabels, temaData, chartTemas, c => { chartTemas = c; });

  // Distribución por frecuencia
  const freqLabels = data.distribucion_por_frecuencia.map(r => r.frecuencia);
  const freqData = data.distribucion_por_frecuencia.map(r => r.cantidad);
  renderDoughnutChart('chart-frecuencias', freqLabels, freqData, chartFrecuencias, c => { chartFrecuencias = c; });
}

function renderBarChart(canvasId, labels, data, color, existingChart, setter) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (existingChart) existingChart.destroy();

  const chart = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: color + '33',
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
  setter(chart);
}

function renderDoughnutChart(canvasId, labels, data, existingChart, setter) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (existingChart) existingChart.destroy();

  const chart = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
        }
      }
    }
  });
  setter(chart);
}

function renderRanking(areas) {
  const container = document.getElementById('ranking-container');
  if (!areas || areas.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem;">Sin datos de áreas</p>';
    return;
  }

  let html = `<table class="ranking-table">
    <thead><tr><th>#</th><th>Área</th><th>Datasets</th><th>Al día</th><th>Cumplimiento</th><th></th></tr></thead><tbody>`;

  areas.forEach((area, i) => {
    const color = area.porcentaje >= 80 ? '#10b981' : area.porcentaje >= 50 ? '#f59e0b' : '#ef4444';
    html += `<tr>
      <td>${i + 1}</td>
      <td>${Utils.escapeHtml(area.area)}</td>
      <td>${area.total_datasets}</td>
      <td>${area.al_dia}</td>
      <td>${area.porcentaje}%</td>
      <td style="width:120px"><div class="progress-bar-container"><div class="progress-bar" style="width:${area.porcentaje}%;background:${color}"></div></div></td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// =====================================================
// MÉTRICAS MANUALES
// =====================================================

async function cargarMetricasManuales() {
  try {
    const meses = document.getElementById('metricas-periodo').value;
    const response = await fetch(`${CONFIG.API_URL}/gestion/metricas-manuales?meses=${meses}`, {
      headers: Auth.getAuthHeaders(),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!result.success) return;

    const list = document.getElementById('metricas-manuales-list');
    if (!list) return;

    if (result.data.length === 0) {
      list.innerHTML = '<p style="color:var(--gray-500);font-size:0.85rem;margin-top:8px;">No hay métricas manuales cargadas para este período</p>';
      return;
    }

    const isAdmin = Auth.isAdmin();
    list.innerHTML = result.data.map(m => `
      <div class="metrica-item">
        <span class="metrica-tipo">${TIPO_METRICA_LABELS[m.tipo] || m.tipo}</span>
        <span class="metrica-periodo">${MESES_FULL[m.mes - 1]} ${m.anio}</span>
        <span class="metrica-cantidad">${m.cantidad}</span>
        ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="eliminarMetricaManual(${m.id})" style="margin-left:auto;padding:4px 8px;font-size:0.75rem;">&times;</button>` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando métricas manuales:', error);
  }
}

async function guardarMetricaManual() {
  try {
    const tipo = document.getElementById('metrica-tipo').value;
    const anio = parseInt(document.getElementById('metrica-anio').value);
    const mes = parseInt(document.getElementById('metrica-mes').value);
    const cantidad = parseInt(document.getElementById('metrica-cantidad').value);

    if (isNaN(cantidad) || cantidad < 0) {
      Utils.showError('La cantidad debe ser un número positivo');
      return;
    }

    const response = await fetch(`${CONFIG.API_URL}/gestion/metricas-manuales`, {
      method: 'POST',
      headers: Auth.getAuthHeaders(),
      body: JSON.stringify({ tipo, anio, mes, cantidad })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast(result.message || 'Métrica guardada', 'success');
    document.getElementById('metrica-cantidad').value = '0';
    await cargarMetricasManuales();
  } catch (error) {
    Utils.showError(error.message || 'Error al guardar métrica');
  }
}

async function eliminarMetricaManual(id) {
  if (!confirm('¿Eliminar esta métrica?')) return;
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/metricas-manuales/${id}`, {
      method: 'DELETE',
      headers: Auth.getAuthHeaders()
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast('Métrica eliminada', 'success');
    await cargarMetricasManuales();
  } catch (error) {
    Utils.showError(error.message || 'Error al eliminar métrica');
  }
}

// =====================================================
// EXPORTACIÓN CSV
// =====================================================

async function exportarCSV() {
  try {
    const meses = document.getElementById('metricas-periodo').value;
    const response = await fetch(`${CONFIG.API_URL}/gestion/metricas/csv?meses=${meses}`, {
      headers: Auth.getAuthHeaders()
    });

    if (!response.ok) throw new Error('Error al exportar');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('CSV exportado', 'success');
  } catch (error) {
    Utils.showError(error.message || 'Error al exportar CSV');
  }
}

// =====================================================
// PROYECTOS
// =====================================================

async function cargarAreasSelect() {
  try {
    const areas = await API.getAreas();
    const select = document.getElementById('proy-areas');
    if (!select) return;
    select.innerHTML = areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.nombre)}</option>`).join('');
  } catch (error) {
    console.error('Error cargando áreas:', error);
  }
}

async function cargarProyectos() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/proyectos`, {
      headers: Auth.getAuthHeaders(),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    renderProyectosLista(result.data);
    cargarTimeline();
  } catch (error) {
    console.error('Error cargando proyectos:', error);
    Utils.showError('Error al cargar proyectos');
  }
}

function renderProyectosLista(proyectos) {
  const container = document.getElementById('proyectos-lista');
  if (!container) return;

  if (proyectos.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:40px;">No hay proyectos registrados</p>';
    return;
  }

  // Agrupar por categoría
  const grupos = {};
  for (const p of proyectos) {
    if (!grupos[p.categoria]) grupos[p.categoria] = [];
    grupos[p.categoria].push(p);
  }

  const orden = ['tecnologia', 'normativa', 'difusion'];
  let html = '';

  for (const cat of orden) {
    if (!grupos[cat]) continue;
    html += `<div class="categoria-header">${CATEGORIA_LABELS[cat]}</div>`;
    html += '<div class="proyectos-grid">';
    for (const p of grupos[cat]) {
      html += `
        <div class="proyecto-card" onclick="verProyecto(${p.id})">
          <div class="proyecto-card-top" style="background:${Utils.escapeHtml(p.color || '#3b82f6')}"></div>
          <div class="proyecto-card-body">
            <div class="proyecto-card-header">
              <h4>${Utils.escapeHtml(p.nombre)}</h4>
            </div>
            ${p.descripcion ? `<p>${Utils.escapeHtml(Utils.truncate(p.descripcion, 100))}</p>` : ''}
            <div class="proyecto-meta">
              <span class="badge badge-estado-${p.estado}">${ESTADO_LABELS[p.estado] || p.estado}</span>
              <span class="badge badge-prioridad-${p.prioridad}">${PRIORIDAD_LABELS[p.prioridad] || p.prioridad}</span>
              <span class="badge badge-hitos">${p.cantidad_hitos || 0} hitos</span>
            </div>
          </div>
        </div>`;
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

async function cargarTimeline() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/timeline`, {
      headers: Auth.getAuthHeaders(),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!result.success) return;

    renderTimeline(result.data);
  } catch (error) {
    console.error('Error cargando timeline:', error);
  }
}

function renderTimeline(hitos) {
  const container = document.getElementById('proyectos-timeline');
  if (!container) return;

  if (hitos.length === 0) {
    container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:40px;">No hay hitos registrados</p>';
    return;
  }

  let html = '<div class="timeline">';
  for (const h of hitos) {
    const color = h.proyecto_color || '#3b82f6';
    html += `
      <div class="timeline-item">
        <style>.timeline-item::before { background: ${color} !important; }</style>
        <div class="timeline-date">${formatDate(h.fecha)}</div>
        <div class="timeline-title">${Utils.escapeHtml(h.titulo)}</div>
        <div class="timeline-proyecto">${Utils.escapeHtml(h.proyecto_nombre)} - ${CATEGORIA_LABELS[h.categoria] || h.categoria}</div>
        ${h.descripcion ? `<div class="timeline-desc">${Utils.escapeHtml(h.descripcion)}</div>` : ''}
      </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function setVistaProyectos(vista) {
  vistaActual = vista;
  document.querySelectorAll('.vista-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.vista-btn[onclick*="${vista}"]`).classList.add('active');

  const lista = document.getElementById('proyectos-lista');
  const timeline = document.getElementById('proyectos-timeline');
  const detalle = document.getElementById('proyecto-detalle');

  if (vista === 'lista') {
    lista.style.display = '';
    timeline.style.display = 'none';
    if (detalle) detalle.style.display = 'none';
  } else {
    lista.style.display = 'none';
    timeline.style.display = '';
    if (detalle) detalle.style.display = 'none';
  }
}

// =====================================================
// DETALLE PROYECTO
// =====================================================

async function verProyecto(id) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/proyectos/${id}`, {
      headers: Auth.getAuthHeaders(),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    proyectoDetalleId = id;
    renderProyectoDetalle(result.data);
  } catch (error) {
    Utils.showError(error.message || 'Error al cargar proyecto');
  }
}

function renderProyectoDetalle(p) {
  const container = document.getElementById('proyecto-detalle');
  const lista = document.getElementById('proyectos-lista');
  const timeline = document.getElementById('proyectos-timeline');

  lista.style.display = 'none';
  timeline.style.display = 'none';
  container.style.display = '';

  const isAdmin = Auth.isAdmin();
  const areasText = p.areas && p.areas.length > 0 ? p.areas.map(a => a.nombre).join(', ') : '-';

  let html = `
    <div class="detail-panel">
      <div class="detail-header">
        <h2 style="display:flex;align-items:center;gap:8px;">
          <span style="width:12px;height:12px;border-radius:50%;background:${Utils.escapeHtml(p.color || '#3b82f6')};display:inline-block;"></span>
          ${Utils.escapeHtml(p.nombre)}
        </h2>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="volverALista()">Volver</button>
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="editarProyecto(${p.id})">Editar</button>
            <button class="btn btn-secondary btn-sm" style="color:#ef4444;" onclick="eliminarProyecto(${p.id})">Eliminar</button>
          ` : ''}
        </div>
      </div>
      ${p.descripcion ? `<p style="color:var(--gray-600);margin-bottom:16px;">${Utils.escapeHtml(p.descripcion)}</p>` : ''}
      <div class="detail-info">
        <div class="detail-field"><label>Estado</label><span class="badge badge-estado-${p.estado}">${ESTADO_LABELS[p.estado]}</span></div>
        <div class="detail-field"><label>Prioridad</label><span class="badge badge-prioridad-${p.prioridad}">${PRIORIDAD_LABELS[p.prioridad]}</span></div>
        <div class="detail-field"><label>Categoría</label><span>${CATEGORIA_LABELS[p.categoria]}</span></div>
        <div class="detail-field"><label>Fecha inicio</label><span>${formatDate(p.fecha_inicio)}</span></div>
        <div class="detail-field"><label>Responsable</label><span>${Utils.escapeHtml(p.responsable || '-')}</span></div>
        <div class="detail-field"><label>Áreas</label><span>${Utils.escapeHtml(areasText)}</span></div>
        ${p.enlace_externo ? `<div class="detail-field"><label>Enlace</label><span><a href="${Utils.escapeHtml(p.enlace_externo)}" target="_blank">${Utils.escapeHtml(Utils.truncate(p.enlace_externo, 50))}</a></span></div>` : ''}
      </div>
    </div>

    <div class="detail-panel">
      <div class="detail-header">
        <h3 style="margin:0;">Hitos</h3>
        ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="abrirModalHito(${p.id})">Nuevo Hito</button>` : ''}
      </div>`;

  if (p.hitos && p.hitos.length > 0) {
    html += '<div class="timeline">';
    for (const h of p.hitos) {
      html += `
        <div class="timeline-item" style="border-left: 3px solid ${Utils.escapeHtml(p.color || '#3b82f6')};">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div class="timeline-date">${formatDate(h.fecha)}</div>
              <div class="timeline-title">${Utils.escapeHtml(h.titulo)}</div>
              ${h.descripcion ? `<div class="timeline-desc">${Utils.escapeHtml(h.descripcion)}</div>` : ''}
              ${h.evidencia_url ? `<a href="${Utils.escapeHtml(h.evidencia_url)}" target="_blank" style="font-size:0.8rem;margin-top:4px;display:inline-block;">Ver evidencia</a>` : ''}
            </div>
            ${isAdmin ? `
              <div style="display:flex;gap:4px;">
                <button class="btn btn-secondary btn-sm" style="padding:2px 6px;font-size:0.7rem;" onclick="editarHito(${h.id}, ${p.id})">Editar</button>
                <button class="btn btn-secondary btn-sm" style="padding:2px 6px;font-size:0.7rem;color:#ef4444;" onclick="eliminarHito(${h.id}, ${p.id})">Eliminar</button>
              </div>
            ` : ''}
          </div>
        </div>`;
    }
    html += '</div>';
  } else {
    html += '<p style="color:var(--gray-500);font-size:0.9rem;">No hay hitos registrados</p>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function volverALista() {
  const container = document.getElementById('proyecto-detalle');
  container.style.display = 'none';
  proyectoDetalleId = null;
  setVistaProyectos(vistaActual);
  cargarProyectos();
}

// =====================================================
// CRUD PROYECTOS
// =====================================================

function abrirModalProyecto(proyectoData = null) {
  editandoProyectoId = proyectoData ? proyectoData.id : null;
  document.getElementById('modal-proyecto-titulo').textContent = proyectoData ? 'Editar Proyecto' : 'Nuevo Proyecto';

  document.getElementById('proy-nombre').value = proyectoData?.nombre || '';
  document.getElementById('proy-descripcion').value = proyectoData?.descripcion || '';
  document.getElementById('proy-estado').value = proyectoData?.estado || 'idea';
  document.getElementById('proy-prioridad').value = proyectoData?.prioridad || 'media';
  document.getElementById('proy-categoria').value = proyectoData?.categoria || 'tecnologia';
  document.getElementById('proy-fecha-inicio').value = proyectoData?.fecha_inicio ? String(proyectoData.fecha_inicio).substring(0, 10) : '';
  document.getElementById('proy-responsable').value = proyectoData?.responsable || '';
  document.getElementById('proy-color').value = proyectoData?.color || '#3b82f6';
  document.getElementById('proy-enlace').value = proyectoData?.enlace_externo || '';

  // Seleccionar áreas
  const areasSelect = document.getElementById('proy-areas');
  const selectedIds = proyectoData?.areas ? proyectoData.areas.map(a => String(a.id)) : [];
  Array.from(areasSelect.options).forEach(opt => {
    opt.selected = selectedIds.includes(opt.value);
  });

  document.getElementById('modal-proyecto').classList.add('active');
}

function cerrarModalProyecto() {
  document.getElementById('modal-proyecto').classList.remove('active');
  editandoProyectoId = null;
}

async function editarProyecto(id) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/proyectos/${id}`, {
      headers: Auth.getAuthHeaders()
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    abrirModalProyecto(result.data);
  } catch (error) {
    Utils.showError('Error al cargar proyecto para edición');
  }
}

async function guardarProyecto() {
  try {
    const nombre = document.getElementById('proy-nombre').value.trim();
    if (!nombre) {
      Utils.showError('El nombre es requerido');
      return;
    }

    const areasSelect = document.getElementById('proy-areas');
    const areas = Array.from(areasSelect.selectedOptions).map(opt => parseInt(opt.value));

    const data = {
      nombre,
      descripcion: document.getElementById('proy-descripcion').value.trim() || null,
      estado: document.getElementById('proy-estado').value,
      prioridad: document.getElementById('proy-prioridad').value,
      categoria: document.getElementById('proy-categoria').value,
      fecha_inicio: document.getElementById('proy-fecha-inicio').value || null,
      responsable: document.getElementById('proy-responsable').value.trim() || null,
      color: document.getElementById('proy-color').value,
      enlace_externo: document.getElementById('proy-enlace').value.trim() || null,
      areas
    };

    const url = editandoProyectoId
      ? `${CONFIG.API_URL}/gestion/proyectos/${editandoProyectoId}`
      : `${CONFIG.API_URL}/gestion/proyectos`;
    const method = editandoProyectoId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: Auth.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast(result.message || 'Proyecto guardado', 'success');
    cerrarModalProyecto();

    if (proyectoDetalleId) {
      await verProyecto(editandoProyectoId || result.data.id);
    }
    await cargarProyectos();
  } catch (error) {
    Utils.showError(error.message || 'Error al guardar proyecto');
  }
}

async function eliminarProyecto(id) {
  if (!confirm('¿Eliminar este proyecto y todos sus hitos?')) return;
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/proyectos/${id}`, {
      method: 'DELETE',
      headers: Auth.getAuthHeaders()
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast('Proyecto eliminado', 'success');
    volverALista();
  } catch (error) {
    Utils.showError(error.message || 'Error al eliminar proyecto');
  }
}

// =====================================================
// CRUD HITOS
// =====================================================

function abrirModalHito(proyectoId, hitoData = null) {
  editandoHitoId = hitoData ? hitoData.id : null;
  document.getElementById('modal-hito-titulo').textContent = hitoData ? 'Editar Hito' : 'Nuevo Hito';

  document.getElementById('hito-titulo').value = hitoData?.titulo || '';
  document.getElementById('hito-fecha').value = hitoData?.fecha ? String(hitoData.fecha).substring(0, 10) : '';
  document.getElementById('hito-descripcion').value = hitoData?.descripcion || '';
  document.getElementById('hito-evidencia-tipo').value = hitoData?.evidencia_tipo || 'ninguno';
  document.getElementById('hito-evidencia-url').value = hitoData?.evidencia_url || '';

  // Store proyecto_id for save
  document.getElementById('modal-hito').dataset.proyectoId = proyectoId;
  document.getElementById('modal-hito').classList.add('active');
}

function cerrarModalHito() {
  document.getElementById('modal-hito').classList.remove('active');
  editandoHitoId = null;
}

async function editarHito(hitoId, proyectoId) {
  // Buscar el hito en el detalle actual
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/proyectos/${proyectoId}`, {
      headers: Auth.getAuthHeaders()
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    const hito = result.data.hitos.find(h => h.id === hitoId);
    if (hito) abrirModalHito(proyectoId, hito);
  } catch (error) {
    Utils.showError('Error al cargar hito');
  }
}

async function guardarHito() {
  try {
    const titulo = document.getElementById('hito-titulo').value.trim();
    const fecha = document.getElementById('hito-fecha').value;
    if (!titulo || !fecha) {
      Utils.showError('Título y fecha son requeridos');
      return;
    }

    const proyectoId = document.getElementById('modal-hito').dataset.proyectoId;
    const data = {
      titulo,
      fecha,
      descripcion: document.getElementById('hito-descripcion').value.trim() || null,
      evidencia_tipo: document.getElementById('hito-evidencia-tipo').value,
      evidencia_url: document.getElementById('hito-evidencia-url').value.trim() || null
    };

    let url, method;
    if (editandoHitoId) {
      url = `${CONFIG.API_URL}/gestion/hitos/${editandoHitoId}`;
      method = 'PUT';
    } else {
      url = `${CONFIG.API_URL}/gestion/proyectos/${proyectoId}/hitos`;
      method = 'POST';
    }

    const response = await fetch(url, { method, headers: Auth.getAuthHeaders(), body: JSON.stringify(data) });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast(result.message || 'Hito guardado', 'success');
    cerrarModalHito();
    await verProyecto(parseInt(proyectoId));
  } catch (error) {
    Utils.showError(error.message || 'Error al guardar hito');
  }
}

async function eliminarHito(hitoId, proyectoId) {
  if (!confirm('¿Eliminar este hito?')) return;
  try {
    const response = await fetch(`${CONFIG.API_URL}/gestion/hitos/${hitoId}`, {
      method: 'DELETE',
      headers: Auth.getAuthHeaders()
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    showToast('Hito eliminado', 'success');
    await verProyecto(proyectoId);
  } catch (error) {
    Utils.showError(error.message || 'Error al eliminar hito');
  }
}
