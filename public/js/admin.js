// Admin - Lógica de administración
let datasets = [];
let temas = [];
let frecuencias = [];
let formatos = [];
let deleteId = null;

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

// === MODAL DATASET ===
function openModal(dataset = null) {
  const modal = document.getElementById('modal-dataset');
  const form = document.getElementById('dataset-form');
  const title = document.getElementById('modal-title');

  form.reset();
  document.getElementById('dataset-id').value = '';

  if (dataset) {
    title.textContent = 'Editar Dataset';
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
  } else {
    title.textContent = 'Nuevo Dataset';
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-dataset').classList.remove('active');
}

async function editDataset(id) {
  const dataset = datasets.find(d => d.id === id);
  if (dataset) {
    openModal(dataset);
  }
}

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

// === MARCAR ACTUALIZADO ===
async function marcarActualizado(id) {
  try {
    await API.registrarActualizacion(id);
    Utils.showSuccess('Dataset marcado como actualizado');
    await loadDatasets();
  } catch (error) {
    Utils.showError(error.message);
  }
}

// === MODAL ELIMINAR ===
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
