// Dataset Detail - Lógica
document.addEventListener('DOMContentLoaded', async () => {
  updateAuthUI();
  await loadDataset();
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

async function loadDataset() {
  const params = Utils.getUrlParams();
  const id = params.id;

  if (!id) {
    showNotFound();
    return;
  }

  try {
    const dataset = await API.getDataset(id);
    
    if (!dataset) {
      showNotFound();
      return;
    }

    renderDataset(dataset);
  } catch (error) {
    console.error('Error cargando dataset:', error);
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('dataset-content').classList.add('hidden');
  document.getElementById('not-found').classList.remove('hidden');
}

function renderDataset(d) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('dataset-content').classList.remove('hidden');

  // Título
  document.title = `${d.titulo} - RPAD`;
  document.getElementById('breadcrumb-title').textContent = d.titulo;
  document.getElementById('dataset-titulo').textContent = d.titulo;
  document.getElementById('dataset-area').textContent = d.area_nombre || 'Sin área asignada';

  // Estado - usar etiqueta larga en el detalle
  const estado = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
  const estadoEl = document.getElementById('dataset-estado');
  estadoEl.textContent = Utils.getEstadoTextoLargo(estado);
  estadoEl.className = `badge ${Utils.getEstadoClase(estado)}`;

  // Temas - usar nombres correctos del backend
  const temasContainer = document.getElementById('dataset-temas');
  const temas = [];
  if (d.tema_principal_nombre) temas.push(d.tema_principal_nombre);
  if (d.tema_secundario_nombre) temas.push(d.tema_secundario_nombre);
  temasContainer.innerHTML = temas.map(t => `<span class="tema-tag">${Utils.escapeHtml(t)}</span>`).join('');

  // Descripción
  document.getElementById('dataset-descripcion').textContent = d.descripcion || 'Sin descripción disponible';

  // Observaciones
  if (d.observaciones) {
    document.getElementById('observaciones-card').classList.remove('hidden');
    document.getElementById('dataset-observaciones').textContent = d.observaciones;
  }

  // URL - el backend usa url_dataset
  if (d.url_dataset) {
    document.getElementById('url-card').classList.remove('hidden');
    document.getElementById('dataset-url').href = d.url_dataset;
  }

  // Fechas
  document.getElementById('fecha-ultima').textContent = Utils.formatDate(d.ultima_actualizacion);
  
  const proximaEl = document.getElementById('fecha-proxima');
  if (d.frecuencia_dias === null) {
    proximaEl.textContent = 'Eventual';
  } else {
    proximaEl.textContent = Utils.formatDate(d.proxima_actualizacion);
  }

  // Info técnica
  document.getElementById('info-frecuencia').textContent = d.frecuencia_nombre || '-';
  
  const formatos = [];
  if (d.formato_primario) formatos.push(d.formato_primario);
  if (d.formato_secundario) formatos.push(d.formato_secundario);
  document.getElementById('info-formatos').textContent = formatos.join(', ') || '-';
  
  // Tipo de gestión
  document.getElementById('info-tipo-gestion').textContent = Utils.getTipoGestionTexto(d.tipo_gestion);
}
