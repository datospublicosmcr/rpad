// Dashboard - Lógica principal
document.addEventListener('DOMContentLoaded', async () => {
  updateAuthUI();
  await loadDashboard();
});

function updateAuthUI() {
  const actions = document.getElementById('header-actions');
  if (Auth.isAuthenticated()) {
    const user = Auth.getUser();
    actions.innerHTML = `
      <a href="admin.html" class="btn btn-primary btn-sm">
        <span>⚙️</span> <span>Admin</span>
      </a>
      <button onclick="Auth.logout()" class="btn btn-outline btn-sm">
        <span>🚪</span> <span>Salir</span>
      </button>
    `;
  }
}

async function loadDashboard() {
  try {
    const [estadisticas, datasets] = await Promise.all([
      API.getEstadisticas(),
      API.getDatasets()
    ]);

    renderStats(estadisticas);
    renderEstadoChart(estadisticas);
    renderAlertas(datasets);
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    Utils.showError('Error al cargar el dashboard');
  }
}

function renderStats(stats) {
  const container = document.getElementById('stats-grid');
  container.innerHTML = `
    <div class="stat-card primary">
      <div class="stat-card-header">
        <span class="stat-card-label">Total Datasets</span>
        <div class="stat-card-icon">📊</div>
      </div>
      <div class="stat-card-value">${stats.total || 0}</div>
    </div>
    <div class="stat-card success">
      <div class="stat-card-header">
        <span class="stat-card-label">Actualizados</span>
        <div class="stat-card-icon">✅</div>
      </div>
      <div class="stat-card-value">${stats.actualizados || 0}</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-card-header">
        <span class="stat-card-label">Vencen en 60 días o menos</span>
        <div class="stat-card-icon">⏰</div>
      </div>
      <div class="stat-card-value">${stats.proximos || 0}</div>
    </div>
    <div class="stat-card danger">
      <div class="stat-card-header">
        <span class="stat-card-label">Atrasados</span>
        <div class="stat-card-icon">⚠️</div>
      </div>
      <div class="stat-card-value">${stats.atrasados || 0}</div>
    </div>
  `;
}

function renderEstadoChart(stats) {
  const container = document.getElementById('estado-chart');
  const total = stats.total || 1;
  const pctActualizados = Math.round((stats.actualizados / total) * 100);
  const pctProximos = Math.round((stats.proximos / total) * 100);
  const pctAtrasados = Math.round((stats.atrasados / total) * 100);
  
  // Tasa = (actualizados + próximos) / total (los próximos aún no vencieron)
  const tasaActualizacion = Math.round(((stats.actualizados + stats.proximos) / total) * 100);

  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div class="flex justify-between mb-1">
        <span class="text-small">Actualizados</span>
        <span class="text-small text-muted">${stats.actualizados} (${pctActualizados}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill success" style="width: ${pctActualizados}%"></div>
      </div>
    </div>
    <div style="margin-bottom: 1rem;">
      <div class="flex justify-between mb-1">
        <span class="text-small">Vencen en 60 días o menos</span>
        <span class="text-small text-muted">${stats.proximos} (${pctProximos}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill warning" style="width: ${pctProximos}%"></div>
      </div>
    </div>
    <div>
      <div class="flex justify-between mb-1">
        <span class="text-small">Atrasados</span>
        <span class="text-small text-muted">${stats.atrasados} (${pctAtrasados}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill danger" style="width: ${pctAtrasados}%"></div>
      </div>
    </div>
    <div style="margin-top: 1.5rem; text-align: center;">
      <div class="text-small text-muted">Tasa de actualización</div>
      <div style="font-size: 2rem; font-weight: 700; color: ${tasaActualizacion >= 80 ? 'var(--success)' : tasaActualizacion >= 50 ? 'var(--warning)' : 'var(--danger)'}">
        ${tasaActualizacion}%
      </div>
    </div>
  `;
}

function renderAlertas(datasets) {
  // Filtrar atrasados y próximos
  const atrasados = datasets
    .filter(d => Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias) === 'atrasado')
    .sort((a, b) => new Date(a.proxima_actualizacion) - new Date(b.proxima_actualizacion));

  const proximos = datasets
    .filter(d => Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias) === 'proximo')
    .sort((a, b) => new Date(a.proxima_actualizacion) - new Date(b.proxima_actualizacion));

  const mostrarInicial = 3;

  // Renderizar atrasados (mostrar 3, con botón "Ver más")
  const alertasContainer = document.getElementById('alertas-list');
  if (atrasados.length) {
    const hayMas = atrasados.length > mostrarInicial;
    
    let html = atrasados.map((d, index) => {
      const dias = Math.abs(Utils.getDiasRestantes(d.proxima_actualizacion));
      const oculto = index >= mostrarInicial ? 'style="display: none;"' : '';
      return `
        <a href="dataset.html?id=${d.id}" class="alert-item atrasado" data-index="${index}" ${oculto}>
          <div>
            <div class="alert-item-title">${Utils.escapeHtml(d.titulo)}</div>
            <div class="alert-item-meta">${dias} días de atraso</div>
          </div>
          <span class="badge badge-danger">Atrasado</span>
        </a>
      `;
    }).join('');
    
    if (hayMas) {
      html += `
        <button id="btn-ver-mas-atrasados" class="btn-ver-mas" onclick="toggleAtrasados()">
          Ver más (${atrasados.length - mostrarInicial} restantes)
        </button>
      `;
    }
    
    alertasContainer.innerHTML = html;
  } else {
    alertasContainer.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
        <p class="text-muted">No hay datasets atrasados</p>
      </div>
    `;
  }

  // Renderizar próximos (mostrar 3, con botón "Ver más")
  const proximosContainer = document.getElementById('proximos-list');
  if (proximos.length) {
    const hayMasProximos = proximos.length > mostrarInicial;
    
    let htmlProximos = proximos.map((d, index) => {
      const dias = Utils.getDiasRestantes(d.proxima_actualizacion);
      const oculto = index >= mostrarInicial ? 'style="display: none;"' : '';
      return `
        <a href="dataset.html?id=${d.id}" class="alert-item proximo" data-index="${index}" ${oculto}>
          <div>
            <div class="alert-item-title">${Utils.escapeHtml(d.titulo)}</div>
            <div class="alert-item-meta">Vence en ${dias} días</div>
          </div>
          <span class="badge badge-warning">Próximo</span>
        </a>
      `;
    }).join('');
    
    if (hayMasProximos) {
      htmlProximos += `
        <button id="btn-ver-mas-proximos" class="btn-ver-mas" onclick="toggleProximos()">
          Ver más (${proximos.length - mostrarInicial} restantes)
        </button>
      `;
    }
    
    proximosContainer.innerHTML = htmlProximos;
  } else {
    proximosContainer.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📅</div>
        <p class="text-muted">No hay datasets próximos a vencer</p>
      </div>
    `;
  }
}

// Función global para toggle de atrasados
function toggleAtrasados() {
  const items = document.querySelectorAll('#alertas-list .alert-item');
  const btn = document.getElementById('btn-ver-mas-atrasados');
  const mostrarInicial = 3;
  
  const estanOcultos = items[mostrarInicial]?.style.display === 'none';
  
  items.forEach((item, index) => {
    if (index >= mostrarInicial) {
      item.style.display = estanOcultos ? 'flex' : 'none';
    }
  });
  
  if (estanOcultos) {
    btn.textContent = 'Ver menos';
  } else {
    const restantes = items.length - mostrarInicial;
    btn.textContent = `Ver más (${restantes} restantes)`;
  }
}

// Función global para toggle de próximos
function toggleProximos() {
  const items = document.querySelectorAll('#proximos-list .alert-item');
  const btn = document.getElementById('btn-ver-mas-proximos');
  const mostrarInicial = 3;
  
  const estanOcultos = items[mostrarInicial]?.style.display === 'none';
  
  items.forEach((item, index) => {
    if (index >= mostrarInicial) {
      item.style.display = estanOcultos ? 'flex' : 'none';
    }
  });
  
  if (estanOcultos) {
    btn.textContent = 'Ver menos';
  } else {
    const restantes = items.length - mostrarInicial;
    btn.textContent = `Ver más (${restantes} restantes)`;
  }
}
