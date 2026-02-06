/**
 * Notas - RPAD
 * Lógica para generación de notas administrativas DOCX
 */

let areasData = [];
let datasetsData = [];
let selectedAreaId = null;
let allDatasetsData = [];

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Fecha por defecto: hoy
  document.getElementById('nota-fecha').value = new Date().toISOString().split('T')[0];

  // Cargar áreas
  await cargarAreas();

  // Cargar todos los datasets para el buscador
  await cargarTodosLosDatasets();
});

/**
 * Cargar áreas en el select
 */
async function cargarAreas() {
  try {
    areasData = await API.getAreas();
    const select = document.getElementById('nota-area');
    
    select.innerHTML = '<option value="">Seleccionar área...</option>';
    
    // Ordenar alfabéticamente
    areasData.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    areasData.forEach(area => {
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
 * Ir al paso 2
 */
async function irAPaso2() {
  const fecha = document.getElementById('nota-fecha').value;
  const numero = document.getElementById('nota-numero').value.trim();
  const areaId = document.getElementById('nota-area').value;

  // Validaciones
  if (!fecha) {
    Utils.showError('Ingrese la fecha de la nota');
    return;
  }
  if (!numero) {
    Utils.showError('Ingrese el número de nota');
    return;
  }
  if (!areaId) {
    Utils.showError('Seleccione un área destinataria');
    return;
  }

  selectedAreaId = areaId;
  const area = areasData.find(a => a.id == areaId);

  // Mostrar info del área
  const tipoNota = document.querySelector('input[name="tipo-nota"]:checked').value;
  let infoHtml = `<strong>Área:</strong> ${Utils.escapeHtml(area.nombre)}`;
  if (area.area_superior) {
    infoHtml += `<br><strong>Dependencia:</strong> ${Utils.escapeHtml(area.area_superior)}`;
  }
  
  // Descripción según tipo de nota
  let tipoTexto = '';
  if (tipoNota === 'interna') {
    tipoTexto = 'Nota Interna (DGMIT → Subsecretaría)';
  } else if (tipoNota === 'externa') {
    tipoTexto = 'Nota Externa (al organismo)';
  } else if (tipoNota === 'escalonada') {
    tipoTexto = 'Nota Escalonada (DDPC → DGMIT → Subsecretaría)';
  }
  infoHtml += `<br><strong>Tipo:</strong> ${tipoTexto}`;
  
  document.getElementById('area-info').innerHTML = infoHtml;

  // Cambiar indicadores
  document.getElementById('step-indicator').textContent = 'Paso 2 de 2';
  document.getElementById('step-title').textContent = 'Selección de Datasets';

  // Ocultar paso 1, mostrar paso 2
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');

  // Cargar datasets del área
  await cargarDatasetsDelArea(areaId);
}

/**
 * Volver al paso 1
 */
function volverAPaso1() {
  document.getElementById('step-indicator').textContent = 'Paso 1 de 2';
  document.getElementById('step-title').textContent = 'Datos de la Nota';
  
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
}

/**
 * Cargar datasets de un área específica
 */
async function cargarDatasetsDelArea(areaId) {
  const container = document.getElementById('datasets-container');
  const noDataMsg = document.getElementById('no-datasets-msg');
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  noDataMsg.classList.add('hidden');

  try {
    const allDatasets = await API.getDatasets();
    datasetsData = allDatasets.filter(d => d.area_id == areaId);

    if (datasetsData.length === 0) {
      container.innerHTML = '';
      noDataMsg.classList.remove('hidden');
      document.getElementById('btn-generar').disabled = true;
      return;
    }

    // Renderizar lista de datasets
    let html = '<div class="datasets-list">';
    datasetsData.forEach((ds, index) => {
      html += `
        <div class="dataset-item">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <input type="checkbox" id="ds-${ds.id}" class="dataset-checkbox" data-id="${ds.id}" onchange="actualizarBotonGenerar()">
            <div style="flex: 1;">
              <label for="ds-${ds.id}" style="font-weight: 500; cursor: pointer;">${Utils.escapeHtml(ds.titulo)}</label>
              <div class="text-small text-muted" style="margin-top: 0.25rem;">
                Frecuencia: ${Utils.escapeHtml(ds.frecuencia_nombre || 'No especificada')}
              </div>
              <div class="form-row" style="margin-top: 0.75rem;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label text-small">Período desde</label>
                  <input type="date" id="ds-${ds.id}-desde" class="form-input" style="padding: 0.4rem 0.6rem;">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label text-small">Período hasta</label>
                  <input type="date" id="ds-${ds.id}-hasta" class="form-input" style="padding: 0.4rem 0.6rem;">
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error('Error cargando datasets:', error);
    container.innerHTML = '<p class="text-danger">Error al cargar datasets</p>';
  }
}

/**
 * Seleccionar todos los datasets
 */
function seleccionarTodos() {
  const checkboxes = document.querySelectorAll('.dataset-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => {
    cb.checked = !allChecked;
  });
  
  actualizarBotonGenerar();
}

/**
 * Actualizar estado del botón generar
 */
function actualizarBotonGenerar() {
  const checkboxes = document.querySelectorAll('.dataset-checkbox:checked');
  document.getElementById('btn-generar').disabled = checkboxes.length === 0;
}

/**
 * Generar la nota DOCX
 */
async function generarNota() {
  const fecha = document.getElementById('nota-fecha').value;
  const numero = document.getElementById('nota-numero').value.trim();
  const areaId = document.getElementById('nota-area').value;
  const tipo = document.querySelector('input[name="tipo-nota"]:checked').value;

  // Recopilar datasets seleccionados
  const checkboxes = document.querySelectorAll('.dataset-checkbox:checked');
  const datasets = [];

  checkboxes.forEach(cb => {
    const id = cb.dataset.id;
    const desde = document.getElementById(`ds-${id}-desde`).value;
    const hasta = document.getElementById(`ds-${id}-hasta`).value;
    
    datasets.push({
      id: parseInt(id),
      periodo_inicial: desde || null,
      periodo_final: hasta || null
    });
  });

  if (datasets.length === 0) {
    Utils.showError('Seleccione al menos un dataset');
    return;
  }

  // Deshabilitar botón mientras se genera
  const btn = document.getElementById('btn-generar');
  const btnTextoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width: 1rem; height: 1rem;"></span> Generando...';

  try {
    const response = await API.generarNota({
      fecha,
      numero,
      area_id: parseInt(areaId),
      tipo,
      datasets
    });

    // Descargar el archivo
    const blob = response;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-${tipo}-${numero.replace('/', '-')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Utils.showSuccess('Nota generada exitosamente');

  } catch (error) {
    console.error('Error generando nota:', error);
    Utils.showError(error.message || 'Error al generar la nota');
  } finally {
    btn.disabled = false;
    btn.innerHTML = btnTextoOriginal;
    actualizarBotonGenerar();
  }
  
  actualizarBotonGenerar();
  }

/**
 * Cargar todos los datasets para el buscador
 */
async function cargarTodosLosDatasets() {
  try {
    allDatasetsData = await API.getDatasets();
  } catch (error) {
    console.error('Error cargando datasets:', error);
  }
}

/**
 * Abrir modal de búsqueda por dataset
 */
function abrirBuscadorDataset() {
  document.getElementById('modal-buscar-dataset').classList.add('active');
  document.getElementById('buscar-dataset-input').value = '';
  document.getElementById('resultados-datasets').innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Escriba para buscar datasets...</p>';
  setTimeout(() => document.getElementById('buscar-dataset-input').focus(), 100);
}

/**
 * Cerrar modal de búsqueda
 */
function cerrarBuscadorDataset() {
  document.getElementById('modal-buscar-dataset').classList.remove('active');
}

/**
 * Filtrar datasets según búsqueda
 */
function filtrarDatasets() {
  const termino = document.getElementById('buscar-dataset-input').value.toLowerCase().trim();
  const contenedor = document.getElementById('resultados-datasets');

  if (termino.length < 2) {
    contenedor.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Escriba al menos 2 caracteres...</p>';
    return;
  }

  const resultados = allDatasetsData.filter(ds => 
    ds.titulo.toLowerCase().includes(termino)
  );

  if (resultados.length === 0) {
    contenedor.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">No se encontraron datasets</p>';
    return;
  }

  contenedor.innerHTML = resultados.map(ds => `
    <div class="dataset-resultado" onclick="seleccionarDatasetArea(${ds.area_id})">
      <div class="dataset-resultado-titulo">${Utils.escapeHtml(ds.titulo)}</div>
      <div class="dataset-resultado-area">Área: ${Utils.escapeHtml(ds.area_nombre || 'Sin área')}</div>
    </div>
  `).join('');
}

/**
 * Seleccionar área desde resultado de dataset
 */
function seleccionarDatasetArea(areaId) {
  document.getElementById('nota-area').value = areaId;
  cerrarBuscadorDataset();
  Utils.showSuccess('Área seleccionada correctamente');
}
