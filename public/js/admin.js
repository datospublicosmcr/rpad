// Admin - Lógica de administración con integración Andino
let datasets = [];
let temas = [];
let frecuencias = [];
let areas = [];
let deleteId = null;
let currentEditDataset = null;
let andinoAreaReferencia = null; // Área de referencia importada de Andino
let datasetsConPendientes = []; // IDs de datasets con cambios pendientes

// Sistema de formatos (chips)
let formatosSeleccionados = new Set();
let formatosCatalogo = [];

// Variables para modal de registrar actualización
let registrarActualizacionId = null;
let registrarActualizacionDataset = null;
let dropZoneActualizar = null;
let dropZoneCrear = null;

// Variables para modal de certificar archivo
let certificarArchivoId = null;
let dropZoneCertificar = null;

// =====================================================
// Utilidades de hash y drop zone (reutilizables)
// =====================================================

// SHA-256 en JavaScript puro (fallback para contextos HTTP sin crypto.subtle)
function sha256JS(data) {
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ]);
  const rr = (v, n) => (v >>> n) | (v << (32 - n));
  const bytes = new Uint8Array(data);
  const len = bytes.length;
  const padLen = (((len + 8) >> 6) << 6) + 64;
  const padded = new Uint8Array(padLen);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 8, Math.floor(len / 0x20000000), false);
  view.setUint32(padLen - 4, (len * 8) >>> 0, false);
  let H0=0x6a09e667,H1=0xbb67ae85,H2=0x3c6ef372,H3=0xa54ff53a;
  let H4=0x510e527f,H5=0x9b05688c,H6=0x1f83d9ab,H7=0x5be0cd19;
  const W = new Uint32Array(64);
  for (let off = 0; off < padLen; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rr(W[i-15],7)^rr(W[i-15],18)^(W[i-15]>>>3);
      const s1 = rr(W[i-2],17)^rr(W[i-2],19)^(W[i-2]>>>10);
      W[i] = (W[i-16]+s0+W[i-7]+s1)|0;
    }
    let a=H0,b=H1,c=H2,d=H3,e=H4,f=H5,g=H6,h=H7;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e,6)^rr(e,11)^rr(e,25);
      const ch = (e&f)^(~e&g);
      const t1 = (h+S1+ch+K[i]+W[i])|0;
      const S0 = rr(a,2)^rr(a,13)^rr(a,22);
      const maj = (a&b)^(a&c)^(b&c);
      const t2 = (S0+maj)|0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
    }
    H0=(H0+a)|0;H1=(H1+b)|0;H2=(H2+c)|0;H3=(H3+d)|0;
    H4=(H4+e)|0;H5=(H5+f)|0;H6=(H6+g)|0;H7=(H7+h)|0;
  }
  const hex = v => (v>>>0).toString(16).padStart(8,'0');
  return hex(H0)+hex(H1)+hex(H2)+hex(H3)+hex(H4)+hex(H5)+hex(H6)+hex(H7);
}

// Calcular SHA-256: Web Crypto API si disponible, sino fallback JS puro
async function calcularHashArchivo(file) {
  const buffer = await file.arrayBuffer();
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return '0x' + sha256JS(buffer);
}

/**
 * Inicializar drop zone reutilizable.
 * @param {Object} config - IDs de los elementos DOM
 * @param {string} config.dropZoneId - ID de la zona de drop
 * @param {string} config.fileInputId - ID del input file
 * @param {string} config.fileInfoId - ID del contenedor de info (se muestra al procesar)
 * @param {string} config.fileNameId - ID del elemento que muestra el nombre
 * @param {string} config.fileSizeId - ID del elemento que muestra el tamaño
 * @param {string} config.fileHashId - ID del elemento que muestra el hash
 * @param {string} config.fileChangeId - ID del botón "Cambiar archivo"
 * @returns {{ getHash: () => string|null, reset: () => void }}
 */
function inicializarDropZone(config) {
  const dropZone = document.getElementById(config.dropZoneId);
  const fileInput = document.getElementById(config.fileInputId);
  const fileInfo = document.getElementById(config.fileInfoId);
  const fileName = document.getElementById(config.fileNameId);
  const fileSize = document.getElementById(config.fileSizeId);
  const fileHash = document.getElementById(config.fileHashId);
  const fileChange = document.getElementById(config.fileChangeId);

  let hashCalculado = null;

  function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async function procesarArchivo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatSize(file.size);
    fileHash.textContent = 'Calculando...';
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    hashCalculado = null;

    try {
      hashCalculado = await calcularHashArchivo(file);
      fileHash.textContent = hashCalculado;
    } catch (error) {
      console.error('Error calculando hash:', error);
      fileHash.textContent = 'Error al calcular hash';
      hashCalculado = null;
    }
  }

  function reset() {
    hashCalculado = null;
    fileInput.value = '';
    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
  }

  // Eventos
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) procesarArchivo(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) procesarArchivo(fileInput.files[0]);
  });

  fileChange.addEventListener('click', reset);

  return {
    getHash: () => hashCalculado,
    reset
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Ocultar elementos de administración si es lector
  if (!Auth.isAdmin()) {
    const btnNuevo = document.getElementById('btn-nuevo-dataset');
    if (btnNuevo) btnNuevo.style.display = 'none';
  }

  await loadCatalogos();
  await loadDatasets();
  setupSearch();
  
  // Cargar indicadores de cambios pendientes (solo admin)
  if (Auth.isAdmin()) {
    await cargarIndicadoresPendientes();
  }
});

async function loadCatalogos() {
  try {
    [temas, frecuencias, formatosCatalogo, areas] = await Promise.all([
      API.getTemas(),
      API.getFrecuencias(),
      API.getFormatos(),
      API.getAreas()
    ]);

    // Llenar selects de temas
    const temaOptions = temas.map(t => `<option value="${t.id}">${Utils.escapeHtml(t.nombre)}</option>`).join('');
    document.getElementById('tema_principal_id').innerHTML = '<option value="">Seleccionar...</option>' + temaOptions;
    document.getElementById('tema_secundario_id').innerHTML = '<option value="">Ninguno</option>' + temaOptions;

    // Llenar select de frecuencias
    document.getElementById('frecuencia_id').innerHTML = '<option value="">Seleccionar...</option>' + 
      frecuencias.map(f => `<option value="${f.id}">${Utils.escapeHtml(f.nombre)}</option>`).join('');

    // Llenar select de áreas
    actualizarSelectAreas();
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
}

function actualizarSelectAreas() {
  const areaOptions = areas.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.nombre)}</option>`).join('');
  document.getElementById('area_id').innerHTML = '<option value="">Seleccionar...</option>' + areaOptions;
}

// =====================================================
// SISTEMA DE CHIPS PARA FORMATOS
// =====================================================

/**
 * Renderiza los chips de formatos habituales y el dropdown de no habituales
 */
function renderizarChipsFormatos() {
  const container = document.getElementById('chips-container');
  const dropdown = document.getElementById('formato-dropdown');
  
  if (!container || !dropdown) return;
  
  // Separar habituales y no habituales
  const habituales = formatosCatalogo.filter(f => f.habitual === 1);
  const noHabituales = formatosCatalogo.filter(f => f.habitual === 0);
  
  // Renderizar chips habituales
  container.innerHTML = habituales.map(f => {
    const selected = formatosSeleccionados.has(f.id);
    return `
      <span class="chip ${selected ? 'selected' : ''}" 
            data-id="${f.id}" 
            data-habitual="1"
            onclick="toggleChip(${f.id})">
        <span class="check-icon">✓</span>
        ${Utils.escapeHtml(f.nombre)}
      </span>
    `;
  }).join('');
  
  // Agregar chips de formatos no habituales seleccionados
  noHabituales.forEach(f => {
    if (formatosSeleccionados.has(f.id)) {
      container.innerHTML += `
        <span class="chip selected" 
              data-id="${f.id}" 
              data-habitual="0">
          <span class="check-icon">✓</span>
          ${Utils.escapeHtml(f.nombre)}
          <span class="chip-remove" onclick="removeNoHabitual(${f.id}, event)">×</span>
        </span>
      `;
    }
  });
  
  // Llenar dropdown con formatos no habituales no seleccionados
  dropdown.innerHTML = '<option value="">+ Agregar otro formato...</option>';
  noHabituales.forEach(f => {
    if (!formatosSeleccionados.has(f.id)) {
      dropdown.innerHTML += `<option value="${f.id}">${Utils.escapeHtml(f.nombre)}</option>`;
    }
  });
  
  // Event listener para dropdown (solo agregar una vez)
  dropdown.onchange = function() {
    if (this.value) {
      formatosSeleccionados.add(parseInt(this.value));
      renderizarChipsFormatos();
      this.value = '';
    }
  };
  
  // Actualizar estado visual del contenedor
  actualizarEstadoContenedorFormatos();
}

/**
 * Toggle para chips habituales
 */
function toggleChip(id) {
  if (formatosSeleccionados.has(id)) {
    formatosSeleccionados.delete(id);
  } else {
    formatosSeleccionados.add(id);
  }
  renderizarChipsFormatos();
}

/**
 * Remover chip no habitual
 */
function removeNoHabitual(id, event) {
  event.stopPropagation();
  formatosSeleccionados.delete(id);
  renderizarChipsFormatos();
}

/**
 * Actualiza el borde del contenedor según si hay formatos seleccionados
 */
function actualizarEstadoContenedorFormatos() {
  const container = document.getElementById('chips-container');
  if (formatosSeleccionados.size === 0) {
    container.classList.add('error');
  } else {
    container.classList.remove('error');
  }
}

/**
 * Pre-selecciona formatos por nombre (para importación desde Andino)
 */
function preseleccionarFormatosPorNombre(nombresFormatos) {
  if (!nombresFormatos || !Array.isArray(nombresFormatos)) return;
  
  nombresFormatos.forEach(nombre => {
    const formato = formatosCatalogo.find(f => 
      f.nombre.toUpperCase() === nombre.toUpperCase()
    );
    if (formato) {
      formatosSeleccionados.add(formato.id);
    }
  });
}

async function loadDatasets() {
  try {
    datasets = await API.getDatasets();
    // Ordenana alfabéticamente por título
    datasets.sort((a, b) => a.titulo.localeCompare(b.titulo));
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
        (d.area_nombre && d.area_nombre.toLowerCase().includes(term))
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

    // Mostrar tipo de gestión con icono Lucide
    const tipoGestionIcon = d.tipo_gestion === 'interna' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 8-8 8"/><path d="M16 14v-6h-6"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 16 16 8"/><path d="M8 10V8h6"/></svg>';
    const tipoGestionTexto = d.tipo_gestion === 'interna' ? 'Interna' : 'Externa';

    // Verificar si tiene cambios pendientes
    const tienePendientes = datasetEstaBloqueado(d.id);
    const indicadorPendiente = tienePendientes ? '<span class="indicador-pendiente">🟡 Pendiente</span>' : '';
    const claseFila = tienePendientes ? 'fila-bloqueada' : '';

    return `
      <tr class="${claseFila}">
        <td>
          <div style="font-weight: 500;">${Utils.escapeHtml(d.titulo)}${indicadorPendiente}</div>
          <div class="text-small text-muted">${Utils.escapeHtml(d.area_nombre || '-')}</div>
        </td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td><span title="${tipoGestionTexto}">${tipoGestionIcon} ${tipoGestionTexto}</span></td>
        <td>${proximaTexto}</td>
        <td>
            <div class="table-actions" style="display: flex; gap: 6px;">
            ${Auth.isAdmin() ? `
            <button onclick="marcarActualizado(${d.id})" class="btn btn-success btn-sm" style="${tienePendientes ? 'filter: grayscale(100%); opacity: 0.5; pointer-events: none;' : ''}" title="Marcar actualizado${tienePendientes ? ' (Bloqueado)' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>
            <button onclick="abrirCertificarArchivo(${d.id})" class="btn btn-secondary btn-sm" title="Certificar archivo"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></button>
            <button onclick="editDataset(${d.id})" class="btn btn-secondary btn-sm" style="${tienePendientes ? 'filter: grayscale(100%); opacity: 0.5; pointer-events: none;' : ''}" title="Editar${tienePendientes ? ' (Bloqueado)' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
            <button onclick="openDeleteModal(${d.id}, '${Utils.escapeHtml(d.titulo).replace(/'/g, "\\'")}')" class="btn btn-danger btn-sm" style="${tienePendientes ? 'filter: grayscale(100%); opacity: 0.5; pointer-events: none;' : ''}" title="Eliminar${tienePendientes ? ' (Bloqueado)' : ''}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
            ` : '<span class="text-muted text-small">Solo lectura</span>'}
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
  andinoAreaReferencia = null;
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
  andinoAreaReferencia = null;
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

    // Guardar área de referencia de Andino
    andinoAreaReferencia = result.data.area_responsable_texto || null;

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
  const andinoRefSection = document.getElementById('andino-area-referencia');

  form.reset();
  document.getElementById('dataset-id').value = '';
  currentEditDataset = null;
  
  // Resetear formatos seleccionados
  formatosSeleccionados.clear();

  // Ocultar sección de referencia de Andino por defecto
  andinoRefSection.classList.add('hidden');

  if (dataset) {
    // MODO EDICIÓN
    title.textContent = 'Editar Dataset';
    currentEditDataset = dataset;
    document.getElementById('dataset-id').value = dataset.id;
    document.getElementById('titulo').value = dataset.titulo || '';
    document.getElementById('area_id').value = dataset.area_id || '';
    document.getElementById('descripcion').value = dataset.descripcion || '';
    document.getElementById('tema_principal_id').value = dataset.tema_principal_id || '';
    document.getElementById('tema_secundario_id').value = dataset.tema_secundario_id || '';
    document.getElementById('frecuencia_id').value = dataset.frecuencia_id || '';
    document.getElementById('ultima_actualizacion').value = dataset.ultima_actualizacion ? dataset.ultima_actualizacion.split('T')[0] : '';
    document.getElementById('proxima_actualizacion').value = dataset.proxima_actualizacion ? dataset.proxima_actualizacion.split('T')[0] : '';
    document.getElementById('url_dataset').value = dataset.url_dataset || '';
    document.getElementById('observaciones').value = dataset.observaciones || '';
    document.getElementById('tipo_gestion').value = dataset.tipo_gestion || '';
    
    // Cargar formatos existentes
    if (dataset.formatos_array && Array.isArray(dataset.formatos_array)) {
      dataset.formatos_array.forEach(f => formatosSeleccionados.add(f.id));
    }
    
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
      document.getElementById('url_dataset').value = andinoData.url_dataset || '';
      
      // Pre-seleccionar formatos importados de Andino
      if (andinoData.formatos && Array.isArray(andinoData.formatos)) {
        preseleccionarFormatosPorNombre(andinoData.formatos);
      }
      
      // Mostrar área de referencia de Andino
      if (andinoAreaReferencia) {
        document.getElementById('andino-area-texto').textContent = andinoAreaReferencia;
        andinoRefSection.classList.remove('hidden');
      }
    }
  }

  // Renderizar chips de formatos
  renderizarChipsFormatos();

  // Drop zone de archivo: solo visible al crear, oculta al editar
  const dropZoneCrearGroup = document.getElementById('dropZoneCrearGroup');
  if (!dataset) {
    dropZoneCrearGroup.classList.remove('hidden');
    if (!dropZoneCrear) {
      dropZoneCrear = inicializarDropZone({
        dropZoneId: 'dropZoneCrear',
        fileInputId: 'fileInputCrear',
        fileInfoId: 'fileInfoCrear',
        fileNameId: 'fileNameCrear',
        fileSizeId: 'fileSizeCrear',
        fileHashId: 'fileHashCrear',
        fileChangeId: 'fileChangeCrear'
      });
    } else {
      dropZoneCrear.reset();
    }
  } else {
    dropZoneCrearGroup.classList.add('hidden');
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-dataset').classList.remove('active');
  currentEditDataset = null;
  andinoAreaReferencia = null;
  // Resetear drop zone de crear si existe
  if (dropZoneCrear) dropZoneCrear.reset();
}

async function editDataset(id) {
  // Verificar bloqueo por cambios pendientes
  if (datasetEstaBloqueado(id)) {
    mostrarMensajeBloqueo();
    return;
  }

  try {
    const dataset = await API.getDataset(id);
    if (dataset) {
      openModal(dataset);
    }
  } catch (error) {
    console.error('Error cargando dataset:', error);
    Utils.showError('Error al cargar el dataset');
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

    // Actualizar título y descripción
    document.getElementById('titulo').value = result.data.titulo || '';
    document.getElementById('descripcion').value = result.data.descripcion || '';

    // Actualizar formatos si vienen del portal
    if (result.data.formatos && Array.isArray(result.data.formatos) && result.data.formatos.length > 0) {
      // Agregar los formatos importados (sin eliminar los existentes)
      preseleccionarFormatosPorNombre(result.data.formatos);
      renderizarChipsFormatos();
    }

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
// MODAL CREAR ÁREA RÁPIDA
// =====================================================

function openQuickAreaModal() {
  document.getElementById('quick-area-nombre').value = '';
  document.getElementById('quick-area-error').classList.add('hidden');
  document.getElementById('modal-quick-area').classList.add('active');
  setTimeout(() => document.getElementById('quick-area-nombre').focus(), 100);
}

function closeQuickAreaModal() {
  document.getElementById('modal-quick-area').classList.remove('active');
}

async function saveQuickArea() {
  const nombre = document.getElementById('quick-area-nombre').value.trim();
  const errorDiv = document.getElementById('quick-area-error');
  const btnGuardar = document.getElementById('btn-quick-area-save');

  if (!nombre) {
    errorDiv.textContent = 'El nombre del área es obligatorio';
    errorDiv.classList.remove('hidden');
    return;
  }

  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';
  errorDiv.classList.add('hidden');

  try {
    const nuevaArea = await API.createArea({ nombre });
    
    // Agregar al array local y actualizar select
    areas.push(nuevaArea);
    areas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    actualizarSelectAreas();
    
    // Seleccionar la nueva área
    document.getElementById('area_id').value = nuevaArea.id;
    
    closeQuickAreaModal();
    Utils.showSuccess('Área creada correctamente');
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.classList.remove('hidden');
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
}

// =====================================================
// SUBMIT FORMULARIO
// =====================================================

document.getElementById('dataset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Validar que hay al menos un formato seleccionado
  if (formatosSeleccionados.size === 0) {
    Utils.showError('Debe seleccionar al menos un formato');
    actualizarEstadoContenedorFormatos();
    return;
  }
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  const id = document.getElementById('dataset-id').value;
  const data = {
    titulo: document.getElementById('titulo').value,
    area_id: parseInt(document.getElementById('area_id').value),
    descripcion: document.getElementById('descripcion').value,
    tema_principal_id: parseInt(document.getElementById('tema_principal_id').value),
    tema_secundario_id: document.getElementById('tema_secundario_id').value ? parseInt(document.getElementById('tema_secundario_id').value) : null,
    frecuencia_id: parseInt(document.getElementById('frecuencia_id').value),
    formatos: Array.from(formatosSeleccionados),
    ultima_actualizacion: document.getElementById('ultima_actualizacion').value || null,
    proxima_actualizacion: document.getElementById('proxima_actualizacion').value || null,
    url_dataset: document.getElementById('url_dataset').value || null,
    observaciones: document.getElementById('observaciones').value || null,
    tipo_gestion: document.getElementById('tipo_gestion').value
  };

  // Incluir file_hash si estamos creando y hay archivo certificado
  if (!id && dropZoneCrear && dropZoneCrear.getHash()) {
    data.file_hash = dropZoneCrear.getHash();
  }

  try {
    if (id) {
      await API.updateDataset(id, data);
      Utils.showSuccess('Cambios enviados para aprobación');
    } else {
      await API.createDataset(data);
      Utils.showSuccess('Dataset enviado para aprobación');
    }
    closeModal();
    await loadDatasets();
    await cargarIndicadoresPendientes();
  } catch (error) {
    // Mensaje especial si no hubo cambios reales - mostrar dentro del modal
    if (error.message && error.message.includes('No se detectaron cambios')) {
      // Mostrar error dentro del modal
      let errorDiv = document.getElementById('modal-form-error');
      if (!errorDiv) {
        // Crear div de error si no existe
        errorDiv = document.createElement('div');
        errorDiv.id = 'modal-form-error';
        errorDiv.style.cssText = 'background: #fee2e2; color: #dc2626; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;';
        const form = document.getElementById('dataset-form');
        form.insertBefore(errorDiv, form.firstChild);
      }
      errorDiv.innerHTML = '⚠️ No realizaste ningún cambio. Modificá al menos un campo para guardar.';
      errorDiv.style.display = 'flex';
      // Scroll al inicio del modal para ver el error
      document.querySelector('.modal-body').scrollTop = 0;
    } else {
      Utils.showError(error.message);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

// =====================================================
// MARCAR ACTUALIZADO
// =====================================================

async function marcarActualizado(id) {
  // Abrir modal en lugar de registrar directamente
  await abrirRegistrarActualizacion(id);
}

// =====================================================
// MODAL ELIMINAR
// =====================================================

function openDeleteModal(id, nombre) {
  // Verificar bloqueo por cambios pendientes
  if (datasetEstaBloqueado(id)) {
    mostrarMensajeBloqueo();
    return;
  }

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
    Utils.showSuccess('Solicitud de eliminación enviada para aprobación');
    closeDeleteModal();
    await loadDatasets();
    await cargarIndicadoresPendientes();
  } catch (error) {
    Utils.showError(error.message);
  }
}

// =====================================================
// SISTEMA DE CAMBIOS PENDIENTES (v1.5.0)
// =====================================================

/**
 * Carga indicadores de cambios pendientes
 */
async function cargarIndicadoresPendientes() {
  try {
    // Obtener contador para badge
    const { cantidad } = await API.getContadorPendientes();
    const badge = document.getElementById('nav-badge-pendientes');
    if (badge) {
      if (cantidad > 0) {
        badge.textContent = cantidad;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }

    // Obtener datasets bloqueados
    datasetsConPendientes = await API.getDatasetsConPendientes();
    
    // Re-renderizar tabla si ya hay datos
    if (datasets.length > 0) {
      const searchTerm = document.getElementById('search').value.toLowerCase();
      const filtered = searchTerm 
        ? datasets.filter(d => d.titulo.toLowerCase().includes(searchTerm) || (d.area_nombre && d.area_nombre.toLowerCase().includes(searchTerm)))
        : datasets;
      renderTable(filtered);
    }
  } catch (error) {
    console.error('Error cargando indicadores de pendientes:', error);
  }
}

/**
 * Verifica si un dataset está bloqueado por cambios pendientes
 */
function datasetEstaBloqueado(id) {
  return datasetsConPendientes.includes(id);
}

/**
 * Muestra mensaje de bloqueo
 */
function mostrarMensajeBloqueo() {
  Utils.showError('Este dataset tiene cambios pendientes de aprobación. No se puede modificar hasta que se resuelvan.');
}

// =====================================================
// REGISTRAR ACTUALIZACIÓN (Modal)
// =====================================================

/**
 * Abre el modal de registrar actualización
 */
async function abrirRegistrarActualizacion(id) {
  try {
    // Obtener datos completos del dataset
    const dataset = await API.getDataset(id);
    if (!dataset) {
      Utils.showError('No se pudo cargar el dataset');
      return;
    }

    registrarActualizacionId = id;
    registrarActualizacionDataset = dataset;

    // Obtener frecuencia del catálogo
    const frecuencia = frecuencias.find(f => f.id === dataset.frecuencia_id);
    const esEventual = frecuencia && frecuencia.dias === null;

    // Llenar datos informativos
    document.getElementById('registrar-dataset-titulo').textContent = dataset.titulo;
    document.getElementById('registrar-frecuencia').textContent = frecuencia ? frecuencia.nombre : '-';
    document.getElementById('registrar-proxima-actual').textContent = 
      dataset.proxima_actualizacion ? Utils.formatDate(dataset.proxima_actualizacion) : '-';

    // Proponer fecha de actualización = hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('registrar-ultima').value = hoy;

    // Calcular próxima propuesta
    const proximaGroup = document.getElementById('registrar-proxima-group');
    if (esEventual) {
      // Frecuencia eventual: ocultar campo de próxima
      proximaGroup.style.display = 'none';
      document.getElementById('registrar-proxima').value = '';
    } else {
      proximaGroup.style.display = 'block';
      const proximaPropuesta = calcularProximaPropuesta(dataset.proxima_actualizacion, frecuencia.dias);
      document.getElementById('registrar-proxima').value = proximaPropuesta;
    }

    // Inicializar drop zone (lazy, una sola vez)
    if (!dropZoneActualizar) {
      dropZoneActualizar = inicializarDropZone({
        dropZoneId: 'dropZoneActualizar',
        fileInputId: 'fileInputActualizar',
        fileInfoId: 'fileInfoActualizar',
        fileNameId: 'fileNameActualizar',
        fileSizeId: 'fileSizeActualizar',
        fileHashId: 'fileHashActualizar',
        fileChangeId: 'fileChangeActualizar'
      });
    } else {
      dropZoneActualizar.reset();
    }

    // Mostrar modal
    document.getElementById('modal-registrar-actualizacion').classList.add('active');

  } catch (error) {
    console.error('Error abriendo modal:', error);
    Utils.showError('Error al cargar datos del dataset');
  }
}

/**
 * Calcula la próxima fecha propuesta sumando días de frecuencia a la próxima actual
 */
function calcularProximaPropuesta(proximaActual, diasFrecuencia) {
  if (!proximaActual || !diasFrecuencia) return '';
  
  // Parsear fecha evitando problemas de timezone
  const partes = proximaActual.split('T')[0].split('-');
  const proxima = new Date(partes[0], partes[1] - 1, partes[2]);
  proxima.setDate(proxima.getDate() + diasFrecuencia);
  
  // Formatear como YYYY-MM-DD
  const anio = proxima.getFullYear();
  const mes = String(proxima.getMonth() + 1).padStart(2, '0');
  const dia = String(proxima.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function closeRegistrarActualizacionModal() {
  document.getElementById('modal-registrar-actualizacion').classList.remove('active');
  registrarActualizacionId = null;
  registrarActualizacionDataset = null;
  if (dropZoneActualizar) dropZoneActualizar.reset();
}

async function confirmarRegistrarActualizacion() {
  if (!registrarActualizacionId) return;

  // Validar archivo obligatorio
  const fileHash = dropZoneActualizar ? dropZoneActualizar.getHash() : null;
  if (!fileHash) {
    Utils.showError('Debe seleccionar el archivo del dataset para certificar la actualización');
    return;
  }

  const btnConfirmar = document.getElementById('btn-confirmar-actualizacion');
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = '<span>⏳</span> Guardando...';

  const fechaActualizacion = document.getElementById('registrar-ultima').value;
  const proximaActualizacion = document.getElementById('registrar-proxima').value || null;

  try {
    await API.registrarActualizacion(registrarActualizacionId, {
      fecha_actualizacion: fechaActualizacion,
      proxima_actualizacion: proximaActualizacion,
      file_hash: fileHash
    });

    Utils.showSuccess('Actualización registrada correctamente');
    closeRegistrarActualizacionModal();
    await loadDatasets();
  } catch (error) {
    Utils.showError(error.message);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<span>✔</span> Registrar';
  }
}

// =====================================================
// CERTIFICAR ARCHIVO (Modal — Spec 13.6)
// =====================================================

/**
 * Abre el modal de certificación voluntaria de archivo
 */
async function abrirCertificarArchivo(id) {
  try {
    const dataset = await API.getDataset(id);
    if (!dataset) {
      Utils.showError('No se pudo cargar el dataset');
      return;
    }

    certificarArchivoId = id;

    // Llenar título
    document.getElementById('certificar-dataset-titulo').textContent = dataset.titulo;

    // Inicializar drop zone (lazy, una sola vez)
    if (!dropZoneCertificar) {
      dropZoneCertificar = inicializarDropZone({
        dropZoneId: 'dropZoneCertificar',
        fileInputId: 'fileInputCertificar',
        fileInfoId: 'fileInfoCertificar',
        fileNameId: 'fileNameCertificar',
        fileSizeId: 'fileSizeCertificar',
        fileHashId: 'fileHashCertificar',
        fileChangeId: 'fileChangeCertificar'
      });
    } else {
      dropZoneCertificar.reset();
    }

    // Mostrar modal
    document.getElementById('modal-certificar-archivo').classList.add('active');
  } catch (error) {
    console.error('Error abriendo modal certificar:', error);
    Utils.showError('Error al cargar datos del dataset');
  }
}

function closeCertificarArchivoModal() {
  document.getElementById('modal-certificar-archivo').classList.remove('active');
  certificarArchivoId = null;
  if (dropZoneCertificar) dropZoneCertificar.reset();
}

async function confirmarCertificarArchivo() {
  if (!certificarArchivoId) return;

  const fileHash = dropZoneCertificar ? dropZoneCertificar.getHash() : null;
  if (!fileHash) {
    Utils.showError('Debe seleccionar un archivo para certificar');
    return;
  }

  const btnConfirmar = document.getElementById('btn-confirmar-certificar');
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = '<span>⏳</span> Certificando...';

  try {
    await API.certificarArchivo(certificarArchivoId, { file_hash: fileHash });
    Utils.showSuccess('Archivo enviado a certificar en blockchain');
    closeCertificarArchivoModal();
  } catch (error) {
    Utils.showError(error.message);
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg> Certificar';
  }
}
