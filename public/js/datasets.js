// Datasets - Lógica de listado
let allDatasets = [];
let temas = [];
let frecuencias = [];

document.addEventListener('DOMContentLoaded', async () => {
  updateAuthUI();
  await loadCatalogos();
  await loadDatasets();
  setupFilters();
  applyUrlParams();
});

function updateAuthUI() {
  const actions = document.getElementById('header-actions');
  if (Auth.isAuthenticated()) {
    actions.innerHTML = `
      <a href="admin.html" class="btn btn-primary btn-sm"><span>⚙️</span> <span>Admin</span></a>
      <button onclick="Auth.logout()" class="btn btn-outline btn-sm"><span>🚪</span> <span>Salir</span></button>
    `;
  }
}

async function loadCatalogos() {
  try {
    [temas, frecuencias] = await Promise.all([
      API.getTemas(),
      API.getFrecuencias()
    ]);

    // Llenar select de temas
    const selectTema = document.getElementById('filter-tema');
    temas.forEach(t => {
      selectTema.innerHTML += `<option value="${t.id}">${Utils.escapeHtml(t.nombre)}</option>`;
    });

    // Llenar select de frecuencias
    const selectFrec = document.getElementById('filter-frecuencia');
    frecuencias.forEach(f => {
      selectFrec.innerHTML += `<option value="${f.id}">${Utils.escapeHtml(f.nombre)}</option>`;
    });
  } catch (error) {
    console.error('Error cargando catálogos:', error);
  }
}

async function loadDatasets() {
  try {
    allDatasets = await API.getDatasets();
    renderDatasets(allDatasets);
  } catch (error) {
    console.error('Error cargando datasets:', error);
    Utils.showError('Error al cargar los datasets');
  }
}

function setupFilters() {
  const searchInput = document.getElementById('search');
  const temaSelect = document.getElementById('filter-tema');
  const frecSelect = document.getElementById('filter-frecuencia');
  const estadoSelect = document.getElementById('filter-estado');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 300);
  });

  temaSelect.addEventListener('change', applyFilters);
  frecSelect.addEventListener('change', applyFilters);
  estadoSelect.addEventListener('change', applyFilters);
}

function applyUrlParams() {
  const params = Utils.getUrlParams();
  if (params.tema) document.getElementById('filter-tema').value = params.tema;
  if (params.frecuencia) document.getElementById('filter-frecuencia').value = params.frecuencia;
  if (params.estado) document.getElementById('filter-estado').value = params.estado;
  if (params.busqueda) document.getElementById('search').value = params.busqueda;
  applyFilters();
}

function applyFilters() {
  const busqueda = document.getElementById('search').value.toLowerCase();
  const temaId = document.getElementById('filter-tema').value;
  const frecId = document.getElementById('filter-frecuencia').value;
  const estado = document.getElementById('filter-estado').value;

  let filtered = allDatasets;

  if (busqueda) {
    filtered = filtered.filter(d =>
      d.titulo.toLowerCase().includes(busqueda) ||
      (d.area_responsable && d.area_responsable.toLowerCase().includes(busqueda)) ||
      (d.descripcion && d.descripcion.toLowerCase().includes(busqueda))
    );
  }

  if (temaId) {
    filtered = filtered.filter(d => 
      d.tema_principal_id == temaId || d.tema_secundario_id == temaId
    );
  }

  if (frecId) {
    filtered = filtered.filter(d => d.frecuencia_id == frecId);
  }

  if (estado) {
    filtered = filtered.filter(d => {
      const estadoDataset = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      
      // Filtro especial "vencidos" incluye tanto atrasados como sin-respuesta
      if (estado === 'vencidos') {
        return estadoDataset === 'atrasado' || estadoDataset === 'sin-respuesta';
      }
      
      return estadoDataset === estado;
    });
  }

  // Actualizar URL
  const params = new URLSearchParams();
  if (temaId) params.set('tema', temaId);
  if (frecId) params.set('frecuencia', frecId);
  if (estado) params.set('estado', estado);
  if (busqueda) params.set('busqueda', busqueda);
  
  const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
  history.replaceState(null, '', newUrl);

  renderDatasets(filtered);
}

function limpiarFiltros() {
  document.getElementById('search').value = '';
  document.getElementById('filter-tema').value = '';
  document.getElementById('filter-frecuencia').value = '';
  document.getElementById('filter-estado').value = '';
  history.replaceState(null, '', window.location.pathname);
  renderDatasets(allDatasets);
}

function renderDatasets(datasets) {
  const container = document.getElementById('datasets-grid');
  const emptyState = document.getElementById('empty-state');

  if (!datasets.length) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // Usar tema_principal_nombre del backend
  container.innerHTML = datasets.map(d => {
    const estado = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
    const estadoTexto = Utils.getEstadoTexto(estado);
    const estadoClase = Utils.getEstadoClase(estado);
    
    const formatos = [];
    if (d.formato_primario) formatos.push(d.formato_primario);
    if (d.formato_secundario) formatos.push(d.formato_secundario);

    return `
      <div class="dataset-card">
        <div class="dataset-card-header">
          <div class="dataset-card-title">
            <h3><a href="dataset.html?id=${d.id}">${Utils.escapeHtml(d.titulo)}</a></h3>
            <span class="badge ${estadoClase}">${estadoTexto}</span>
          </div>
          ${d.tema_principal_nombre ? `
            <div class="temas-tags">
              <span class="tema-tag">${Utils.escapeHtml(d.tema_principal_nombre)}</span>
            </div>
          ` : ''}
        </div>
        <div class="dataset-card-body">
          <p class="dataset-card-description">${Utils.escapeHtml(d.descripcion || 'Sin descripción')}</p>
          <div class="dataset-card-meta">
            <span>📍 ${Utils.escapeHtml(d.area_responsable || '-')}</span>
            <span>🔄 ${Utils.escapeHtml(d.frecuencia_nombre || '-')}</span>
          </div>
        </div>
        <div class="dataset-card-footer">
          <div class="dataset-formats">
            ${formatos.map(f => `<span class="format-tag">${f}</span>`).join('')}
          </div>
          <span class="text-xs text-muted">
            ${d.proxima_actualizacion ? `Próx: ${Utils.formatDate(d.proxima_actualizacion)}` : 'Sin fecha'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function exportarCSV() {
  const busqueda = document.getElementById('search').value.toLowerCase();
  const temaId = document.getElementById('filter-tema').value;
  const frecId = document.getElementById('filter-frecuencia').value;
  const estado = document.getElementById('filter-estado').value;

  let filtered = allDatasets;
  if (busqueda) filtered = filtered.filter(d => d.titulo.toLowerCase().includes(busqueda));
  if (temaId) filtered = filtered.filter(d => d.tema_principal_id == temaId);
  if (frecId) filtered = filtered.filter(d => d.frecuencia_id == frecId);
  if (estado) {
    filtered = filtered.filter(d => {
      const estadoDataset = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      if (estado === 'vencidos') {
        return estadoDataset === 'atrasado' || estadoDataset === 'sin-respuesta';
      }
      return estadoDataset === estado;
    });
  }

  const headers = ['Título', 'Área', 'Tema', 'Frecuencia', 'Tipo Gestión', 'Estado', 'Última Actualización', 'Próxima Actualización'];
  const rows = filtered.map(d => [
    d.titulo,
    d.area_responsable || '',
    d.tema_principal_nombre || '',
    d.frecuencia_nombre || '',
    Utils.getTipoGestionTexto(d.tipo_gestion),
    Utils.getEstadoTexto(Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion)),
    Utils.formatDate(d.ultima_actualizacion),
    Utils.formatDate(d.proxima_actualizacion)
  ]);

  const csvContent = '\uFEFF' + [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `datasets-rpad-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
