// Areas - Lógica de gestión de áreas responsables
let areas = [];
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

  // Ocultar botón Nueva Área si es lector
  if (!Auth.isAdmin()) {
    document.getElementById('btn-nueva-area').style.display = 'none';
  }

  await loadAreas();
  setupSearch();
});

async function loadAreas() {
  try {
    areas = await API.getAreas();
    renderTable(areas);
  } catch (error) {
    console.error('Error cargando áreas:', error);
    Utils.showError('Error al cargar las áreas');
  }
}

function setupSearch() {
  const searchInput = document.getElementById('search');
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = searchInput.value.toLowerCase();
      const filtered = areas.filter(a => 
        a.nombre.toLowerCase().includes(term) ||
        (a.area_superior && a.area_superior.toLowerCase().includes(term)) ||
        (a.email_principal && a.email_principal.toLowerCase().includes(term)) ||
        (a.nombre_contacto && a.nombre_contacto.toLowerCase().includes(term))
      );
      renderTable(filtered);
    }, 300);
  });
}

function renderTable(data) {
  const tbody = document.getElementById('areas-tbody');
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">No hay áreas</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(a => {
    const tieneEmail = a.email_principal || a.email_secundario;
    const emailIcon = tieneEmail ? '✅' : '⚠️';
    const emailTitle = tieneEmail ? 'Email configurado' : 'Sin email configurado';

    return `
      <tr>
        <td>
          <div style="font-weight: 500;">${Utils.escapeHtml(a.nombre)}</div>
        </td>
        <td class="text-small text-muted">${Utils.escapeHtml(a.area_superior || '-')}</td>
        <td>
          <span title="${emailTitle}">${emailIcon}</span>
          ${a.email_principal ? `<span class="text-small">${Utils.escapeHtml(a.email_principal)}</span>` : '<span class="text-small text-muted">-</span>'}
        </td>
        <td class="text-small">${Utils.escapeHtml(a.nombre_contacto || '-')}</td>
        <td class="text-center">
          <span class="badge ${a.cantidad_datasets > 0 ? 'badge-primary' : 'badge-secondary'}">${a.cantidad_datasets || 0}</span>
        </td>
        <td>
          <div class="table-actions">
            ${Auth.isAdmin() ? `
            <button onclick="editArea(${a.id})" class="btn btn-secondary btn-sm" title="Editar">✏️</button>
            <button onclick="openDeleteModal(${a.id}, '${Utils.escapeHtml(a.nombre).replace(/'/g, "\\'")}')" class="btn btn-danger btn-sm" title="Eliminar" ${a.cantidad_datasets > 0 ? 'disabled' : ''}>🗑️</button>
            ` : '<span class="text-muted text-small">Solo lectura</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// =====================================================
// MODAL ÁREA
// =====================================================

function openAreaModal(area = null) {
  const modal = document.getElementById('modal-area');
  const form = document.getElementById('area-form');
  const title = document.getElementById('modal-title');

  form.reset();
  document.getElementById('area-id').value = '';

  if (area) {
    title.textContent = 'Editar Área';
    document.getElementById('area-id').value = area.id;
    document.getElementById('nombre').value = area.nombre || '';
    document.getElementById('area_superior').value = area.area_superior || '';
    document.getElementById('email_principal').value = area.email_principal || '';
    document.getElementById('email_secundario').value = area.email_secundario || '';
    document.getElementById('telefono_area').value = area.telefono_area || '';
    document.getElementById('celular_area').value = area.celular_area || '';
    document.getElementById('nombre_contacto').value = area.nombre_contacto || '';
    document.getElementById('telefono_contacto').value = area.telefono_contacto || '';
    document.getElementById('email_contacto').value = area.email_contacto || '';
  } else {
    title.textContent = 'Nueva Área';
  }

  modal.classList.add('active');
  setTimeout(() => document.getElementById('nombre').focus(), 100);
}

function closeAreaModal() {
  document.getElementById('modal-area').classList.remove('active');
}

async function editArea(id) {
  const area = areas.find(a => a.id === id);
  if (area) {
    openAreaModal(area);
  }
}

// Submit formulario
document.getElementById('area-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  const id = document.getElementById('area-id').value;
  const data = {
    nombre: document.getElementById('nombre').value,
    area_superior: document.getElementById('area_superior').value || null,
    email_principal: document.getElementById('email_principal').value || null,
    email_secundario: document.getElementById('email_secundario').value || null,
    telefono_area: document.getElementById('telefono_area').value || null,
    celular_area: document.getElementById('celular_area').value || null,
    nombre_contacto: document.getElementById('nombre_contacto').value || null,
    telefono_contacto: document.getElementById('telefono_contacto').value || null,
    email_contacto: document.getElementById('email_contacto').value || null
  };

  try {
    if (id) {
      await API.updateArea(id, data);
      Utils.showSuccess('Área actualizada correctamente');
    } else {
      await API.createArea(data);
      Utils.showSuccess('Área creada correctamente');
    }
    closeAreaModal();
    await loadAreas();
  } catch (error) {
    Utils.showError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

// =====================================================
// MODAL ELIMINAR
// =====================================================

function openDeleteModal(id, nombre) {
  deleteId = id;
  document.getElementById('delete-area-name').textContent = nombre;
  document.getElementById('modal-delete').classList.add('active');
}

function closeDeleteModal() {
  deleteId = null;
  document.getElementById('modal-delete').classList.remove('active');
}

async function confirmDelete() {
  if (!deleteId) return;

  try {
    await API.deleteArea(deleteId);
    Utils.showSuccess('Área eliminada correctamente');
    closeDeleteModal();
    await loadAreas();
  } catch (error) {
    Utils.showError(error.message);
  }
}
