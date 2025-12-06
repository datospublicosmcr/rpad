// Admin - Lógica de administración con integración Andino
let datasets = [];
let temas = [];
let frecuencias = [];
let formatos = [];
let deleteId = null;
let currentEditDataset = null; // Dataset actual en edición

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar nombre de usuario
  const user = Auth.getUser();
  if (user) {
    document.getElementById('user-name').textContent = `👤 ${user.nombre_completo || user.username}`;
  }

  await loadCatalogos();
  await loadDatasets();
  setupSearch();
});

async function loadCatalogos() {
  try {
    [temas, frecuencias, formatos] = await Promise.all([
      API.getTemas(),
      API.getFrecuencias(),
      API.getFormatos()
    ]);

    // Llenar selects de temas
    const temaOptions = temas.map(t => `<option value="${t.id}">${Utils.escapeHtml(t.nombre)}</option>`).join('');
    document.getElementById('tema_principal_id').innerHTML = '<option value="">Seleccionar...</option>' + temaOptions;
    document.getElementById('tema_secundario_id').innerHTML = '<option value="">Ninguno</option>' + temaOptions;

    // Llenar select de frecuencias
    document.getElementById('frecuencia_id').innerHTML = '<option value="">Seleccionar...</option>' + 
      frecuencias.map(f => `<option value="${f.id}">${Utils.escapeHtml(f.nombre)}</option>`).join('');

    // Llenar selects de formatos
    const formatoOptions = formatos.map(f => `<option value="${f}">${f}</option>`).join('');
    document.getElementById('formato_primario').innerHTML = '<option value="">Seleccionar...</option>' + formatoOptions;
    document.getElementById('formato_secundario').innerHTML = '<option value="">Ninguno</option>' + formatoOptions;
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
}

async function loadDatasets() {
  try {
    datasets = await API.getDatasets();
    renderTable(datasets);
  } catch (error) {
    console.error('Error cargando datasets:', error);
    Utils.showError('Error al cargar los datasets');
  }
}

function setupSearch() {
  const searchInput = document.getElementById('search');
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = searchInput.value.toLowerCase();
      const filtered = datasets.filter(d => 
        d.titulo.toLowerCase().includes(term) ||
        (d.area_responsable && d.area_responsable.toLowerCase().includes(term))
      );
      renderTable(filtered);
    }, 300);
  });
}

function renderTable(data) {
  const tbody = document.getElementById('datasets-tbody');
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No hay datasets</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(d => {
    const estado = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
    const estadoTexto = Utils.getEstadoTexto(estado);
    const estadoClase = Utils.getEstadoClase(estado);
    
    let proximaTexto = '-';
    if (d.frecuencia_dias === null) {
      proximaTexto = 'Eventual';
    } else if (d.proxima_actualizacion) {
      proximaTexto = Utils.formatDate(d.proxima_actualizacion);
    }

    // Mostrar tipo de gestión con icono
    const tipoGestionIcon = d.tipo_gestion === 'interna' ? '🏠' : '📤';
    const tipoGestionTexto = d.tipo_gestion === 'interna' ? 'Interna' : 'Externa';

    return `
      <tr>
        <td>
          <div style="font-weight: 500;">${Utils.escapeHtml(d.titulo)}</div>
          <div class="text-small text-muted">${Utils.escapeHtml(d.area_responsable || '-')}</div>
        </td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td><span title="${tipoGestionTexto}">${tipoGestionIcon} ${tipoGestionTexto}</span></td>
        <td>${proximaTexto}</td>
        <td>
          <div class="table-actions">
            <button onclick="marcarActualizado(${d.id})" class="btn btn-success btn-sm" title="Marcar actualizado">✔</button>
            <button onclick="editDataset(${d.id})" class="btn btn-secondary btn-sm" title="Editar">✏️</button>
            <button onclick="openDeleteModal(${d.id}, '${Utils.escapeHtml(d.titulo).replace(/'/g, "\\'")}')" class="btn btn-danger btn-sm" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// =====================================================
// PASO 1: Modal URL del Portal
// =====================================================

function openStep1Modal() {
  currentEditDataset = null;
  document.getElementById('andino-url').value = '';
  document.getElementById('step1-error').classList.add('hidden');
  document.getElementById('step1-loading').classList.add('hidden');
  document.getElementById('btn-siguiente').disabled = false;
  document.getElementById('modal-step1').classList.add('active');
  
  // Focus en el campo URL
  setTimeout(() => document.getElementById('andino-url').focus(), 100);
}

function closeStep1Modal() {
  document.getElementById('modal-step1').classList.remove('active');
}

// Saltar al paso 2 sin importar (carga manual)
function skipToManualEntry() {
  closeStep1Modal();
  openModal(null);
}

// Consultar API y continuar al paso 2
async function fetchAndContinue() {
  const url = document.getElementById('andino-url').value.trim();
  const errorDiv = document.getElementById('step1-error');
  const loadingDiv = document.getElementById('step1-loading');
  const btnSiguiente = document.getElementById('btn-siguiente');

  // Validar que hay URL
  if (!url) {
    errorDiv.textContent = 'Por favor, ingrese la URL del dataset';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Mostrar loading
  errorDiv.classList.add('hidden');
  loadingDiv.classList.remove('hidden');
  btnSiguiente.disabled = true;

  try {
    const response = await fetch(`${CONFIG.API_URL}/andino/fetch?url=${encodeURIComponent(url)}`);
    const result = await response.json();

    loadingDiv.classList.add('hidden');
    btnSiguiente.disabled = false;

    if (!response.ok || !result.success) {
      // Mostrar error y permitir continuar manualmente
      errorDiv.innerHTML = `
        <strong>⚠️ Error de importación</strong><br>
        ${Utils.escapeHtml(result.error || 'No se pudo obtener información del portal')}<br>
        <span class="text-small">Puede continuar con la carga manual haciendo clic en "Carga manual".</span>
      `;
      errorDiv.classList.remove('hidden');
      return;
    }

    // Éxito: cerrar paso 1 y abrir paso 2 con datos pre-llenados
    closeStep1Modal();
    openModal(null, result.data);

  } catch (error) {
    console.error('Error consultando Andino:', error);
    loadingDiv.classList.add('hidden');
    btnSiguiente.disabled = false;
    errorDiv.innerHTML = `
      <strong>⚠️ Error de conexión</strong><br>
      No se pudo conectar con el servidor. Puede continuar con la carga manual.
    `;
    errorDiv.classList.remove('hidden');
  }
}

// =====================================================
// PASO 2: Modal Formulario Completo
// =====================================================

/**
 * Abre el modal del formulario
 * @param {Object|null} dataset - Dataset existente para editar, o null para nuevo
 * @param {Object|null} andinoData - Datos importados de Andino para pre-llenar
 */
function openModal(dataset = null, andinoData = null) {
  const modal = document.getElementById('modal-dataset');
  const form = document.getElementById('dataset-form');
  const title = document.getElementById('modal-title');
  const andinoUpdateSection = document.getElementById('andino-update-section');

  form.reset();
  document.getElementById('dataset-id').value = '';
  currentEditDataset = null;

  if (dataset) {
    // MODO EDICIÓN
    title.textContent = 'Editar Dataset';
    currentEditDataset = dataset;
    document.getElementById('dataset-id').value = dataset.id;
    document.getElementById('titulo').value = dataset.titulo || '';
    document.getElementById('area_responsable').value = dataset.area_responsable || '';
    document.getElementById('descripcion').value = dataset.descripcion || '';
    document.getElementById('tema_principal_id').value = dataset.tema_principal_id || '';
    document.getElementById('tema_secundario_id').value = dataset.tema_secundario_id || '';
    document.getElementById('frecuencia_id').value = dataset.frecuencia_id || '';
    document.getElementById('formato_primario').value = dataset.formato_primario || '';
    document.getElementById('formato_secundario').value = dataset.formato_secundario || '';
    document.getElementById('ultima_actualizacion').value = dataset.ultima_actualizacion ? dataset.ultima_actualizacion.split('T')[0] : '';
    document.getElementById('proxima_actualizacion').value = dataset.proxima_actualizacion ? dataset.proxima_actualizacion.split('T')[0] : '';
    document.getElementById('url_dataset').value = dataset.url_dataset || '';
    document.getElementById('observaciones').value = dataset.observaciones || '';
    document.getElementById('tipo_gestion').value = dataset.tipo_gestion || '';
    
    // Mostrar botón de actualizar desde portal si tiene URL
    if (dataset.url_dataset && dataset.url_dataset.includes('datos.comodoro.gov.ar')) {
      andinoUpdateSection.classList.remove('hidden');
    } else {
      andinoUpdateSection.classList.add('hidden');
    }
  } else {
    // MODO NUEVO
    title.textContent = 'Nuevo Dataset - Paso 2';
    andinoUpdateSection.classList.add('hidden');
    
    // Si hay datos de Andino, pre-llenar
    if (andinoData) {
      document.getElementById('titulo').value = andinoData.titulo || '';
      document.getElementById('descripcion').value = andinoData.descripcion || '';
      document.getElementById('area_responsable').value = andinoData.area_responsable || '';
      document.getElementById('url_dataset').value = andinoData.url_dataset || '';
    }
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-dataset').classList.remove('active');
  currentEditDataset = null;
}

async function editDataset(id) {
  const dataset = datasets.find(d => d.id === id);
  if (dataset) {
    openModal(dataset);
  }
}

// =====================================================
// ACTUALIZAR DESDE PORTAL (en modo edición)
// =====================================================

function updateFromAndino() {
  // Verificar que hay URL del dataset
  const url = document.getElementById('url_dataset').value.trim();
  if (!url || !url.includes('datos.comodoro.gov.ar')) {
    Utils.showError('No hay una URL válida del portal para actualizar');
    return;
  }

  // Abrir modal de confirmación
  document.getElementById('confirm-update-error').classList.add('hidden');
  document.getElementById('confirm-update-loading').classList.add('hidden');
  document.getElementById('btn-confirm-update').disabled = false;
  document.getElementById('modal-confirm-update').classList.add('active');
}

function closeConfirmUpdateModal() {
  document.getElementById('modal-confirm-update').classList.remove('active');
}

async function confirmUpdateFromAndino() {
  const url = document.getElementById('url_dataset').value.trim();
  const errorDiv = document.getElementById('confirm-update-error');
  const loadingDiv = document.getElementById('confirm-update-loading');
  const btnConfirm = document.getElementById('btn-confirm-update');

  loadingDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
  btnConfirm.disabled = true;

  try {
    const response = await fetch(`${CONFIG.API_URL}/andino/fetch?url=${encodeURIComponent(url)}`);
    const result = await response.json();

    loadingDiv.classList.add('hidden');

    if (!response.ok || !result.success) {
      errorDiv.textContent = result.error || 'No se pudo obtener información del portal';
      errorDiv.classList.remove('hidden');
      btnConfirm.disabled = false;
      return;
    }

    // Actualizar los campos en el formulario
    document.getElementById('titulo').value = result.data.titulo || '';
    document.getElementById('descripcion').value = result.data.descripcion || '';
    document.getElementById('area_responsable').value = result.data.area_responsable || '';

    // Cerrar modal de confirmación
    closeConfirmUpdateModal();
    
    Utils.showSuccess('Datos actualizados desde el portal. Recuerde guardar los cambios.');

  } catch (error) {
    console.error('Error actualizando desde Andino:', error);
    loadingDiv.classList.add('hidden');
    btnConfirm.disabled = false;
    errorDiv.textContent = 'Error de conexión. Intente nuevamente.';
    errorDiv.classList.remove('hidden');
  }
}

// =====================================================
// SUBMIT FORMULARIO
// =====================================================

document.getElementById('dataset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  const id = document.getElementById('dataset-id').value;
  const data = {
    titulo: document.getElementById('titulo').value,
    area_responsable: document.getElementById('area_responsable').value,
    descripcion: document.getElementById('descripcion').value,
    tema_principal_id: parseInt(document.getElementById('tema_principal_id').value),
    tema_secundario_id: document.getElementById('tema_secundario_id').value ? parseInt(document.getElementById('tema_secundario_id').value) : null,
    frecuencia_id: parseInt(document.getElementById('frecuencia_id').value),
    formato_primario: document.getElementById('formato_primario').value,
    formato_secundario: document.getElementById('formato_secundario').value || null,
    ultima_actualizacion: document.getElementById('ultima_actualizacion').value || null,
    proxima_actualizacion: document.getElementById('proxima_actualizacion').value || null,
    url_dataset: document.getElementById('url_dataset').value || null,
    observaciones: document.getElementById('observaciones').value || null,
    tipo_gestion: document.getElementById('tipo_gestion').value
  };

  try {
    if (id) {
      await API.updateDataset(id, data);
      Utils.showSuccess('Dataset actualizado correctamente');
    } else {
      await API.createDataset(data);
      Utils.showSuccess('Dataset creado correctamente');
    }
    closeModal();
    await loadDatasets();
  } catch (error) {
    Utils.showError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

// =====================================================
// MARCAR ACTUALIZADO
// =====================================================

async function marcarActualizado(id) {
  try {
    await API.registrarActualizacion(id);
    Utils.showSuccess('Dataset marcado como actualizado');
    await loadDatasets();
  } catch (error) {
    Utils.showError(error.message);
  }
}

// =====================================================
// MODAL ELIMINAR
// =====================================================

function openDeleteModal(id, nombre) {
  deleteId = id;
  document.getElementById('delete-dataset-name').textContent = nombre;
  document.getElementById('modal-delete').classList.add('active');
}

function closeDeleteModal() {
  deleteId = null;
  document.getElementById('modal-delete').classList.remove('active');
}

async function confirmDelete() {
  if (!deleteId) return;

  try {
    await API.deleteDataset(deleteId);
    Utils.showSuccess('Dataset eliminado correctamente');
    closeDeleteModal();
    await loadDatasets();
  } catch (error) {
    Utils.showError(error.message);
  }
}

// =====================================================
// SISTEMA DE NOTIFICACIONES
// =====================================================

async function verificarConexionSMTP() {
  const statusEl = document.getElementById('smtp-status');
  statusEl.textContent = 'Verificando...';
  statusEl.style.color = '#6c757d';

  try {
    const res = await API.verificarSmtp();
    if (res.success) {
      statusEl.textContent = '✅ Conexión SMTP exitosa';
      statusEl.style.color = '#28a745';
      Utils.showSuccess('Conexión SMTP verificada correctamente');
    } else {
      const errorMsg = res.error || res.message || 'Error desconocido';
      const errorCode = res.code ? ` (${res.code})` : '';
      statusEl.textContent = '❌ Error: ' + errorMsg + errorCode;
      statusEl.style.color = '#dc3545';
      Utils.showError('Error SMTP: ' + errorMsg + errorCode);
    }
  } catch (error) {
    statusEl.textContent = '❌ Error de conexión';
    statusEl.style.color = '#dc3545';
    Utils.showError('Error: ' + error.message);
  }
}

async function verPreviewEmail() {
  const tipo = document.getElementById('tipo-notificacion').value;
  try {
    const htmlContent = await API.previewNotificacion(tipo);
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
  } catch (error) {
    Utils.showError('Error al generar preview: ' + error.message);
  }
}

async function enviarEmailPrueba() {
  const tipo = document.getElementById('tipo-notificacion').value;
  const tipoTexto = document.getElementById('tipo-notificacion').selectedOptions[0].text;
  
  if (!confirm(`⚠️ Esto enviará un email REAL a los destinatarios configurados.\n\nTipo: ${tipoTexto}\n\n¿Continuar?`)) {
    return;
  }

  try {
    Utils.showSuccess('Enviando email...');
    const res = await API.enviarNotificacionPrueba(tipo);
    if (res.success) {
      Utils.showSuccess(`✅ Email enviado. Datasets encontrados: ${res.datasetsEncontrados}`);
    } else {
      Utils.showError(res.message || 'Error al enviar email');
    }
  } catch (error) {
    Utils.showError('Error: ' + error.message);
  }
}
