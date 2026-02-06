// Dashboard - Lógica principal con animaciones y gráficos
let donutChart = null;
let calendarChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  // updateAuthUI() ya no es necesario - está en main.js como initHeader()
  updateHeroGreeting();
  updateHeroDateTime();
  setInterval(updateHeroDateTime, 1000);
  await loadDashboard();
});

// Actualizar saludo en el hero (usa Auth de auth.js y getSaludo de main.js)
function updateHeroGreeting() {
  const heroGreeting = document.getElementById('hero-greeting');
  if (!heroGreeting) return;
  
  if (Auth.isAuthenticated()) {
    const user = Auth.getUser();
    const nombre = user?.nombre_completo?.split(' ')[0] || user?.username || 'Usuario';
    const saludo = getSaludo();
    heroGreeting.textContent = `${saludo}, ${nombre}`;
  } else {
    heroGreeting.textContent = 'Tablero de Seguimiento';
  }
}

function updateHeroDateTime() {
  const now = new Date();
  
  const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  let fechaStr = now.toLocaleDateString('es-AR', opcionesFecha);
  fechaStr = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
  document.getElementById('hero-date').textContent = fechaStr;
  
  const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  document.getElementById('hero-time').textContent = now.toLocaleTimeString('es-AR', opcionesHora);
}

async function loadDashboard() {
  try {
    const [estadisticas, datasets] = await Promise.all([
      API.getEstadisticas(),
      API.getDatasets()
    ]);

    renderStats(estadisticas);
    renderDonutChart(estadisticas);
    renderCalendarChart(datasets);
    renderAlertas(datasets);
    
    const tasa = estadisticas.tasaActualizacion || 0;
    document.getElementById('hero-rate').textContent = `${tasa}%`;
    
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    if (typeof showToast === 'function') {
      showToast('Error al cargar el dashboard', 'error');
    }
  }
}

function animateCounter(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  requestAnimationFrame(update);
}

function renderStats(stats) {
  const container = document.getElementById('stats-grid');
  const totalVencidos = (stats.atrasados || 0) + (stats.sinRespuesta || 0);
  
  // Iconos Lucide para las stat cards
  const iconTotal = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>';
  const iconActualizado = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const iconProximo = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iconVencido = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  
  container.innerHTML = `
    <div class="stat-card primary clickable animate-slide-up" style="animation-delay: 0.05s;" onclick="goToDatasets('')" title="Ver todos los datasets">
      <div class="stat-card-header">
        <span class="stat-card-label">Total Datasets</span>
        <div class="stat-card-icon primary">${iconTotal}</div>
      </div>
      <div class="stat-card-value" data-target="${stats.total || 0}">0</div>
    </div>
    <div class="stat-card success clickable animate-slide-up" style="animation-delay: 0.1s;" onclick="goToDatasets('actualizado')" title="Ver datasets actualizados">
      <div class="stat-card-header">
        <span class="stat-card-label">Actualizados</span>
        <div class="stat-card-icon success">${iconActualizado}</div>
      </div>
      <div class="stat-card-value" data-target="${stats.actualizados || 0}">0</div>
    </div>
    <div class="stat-card warning clickable animate-slide-up" style="animation-delay: 0.15s;" onclick="goToDatasets('proximo')" title="Ver próximos a vencer">
      <div class="stat-card-header">
        <span class="stat-card-label">Vencen en 60 días o menos</span>
        <div class="stat-card-icon warning">${iconProximo}</div>
      </div>
      <div class="stat-card-value" data-target="${stats.proximos || 0}">0</div>
    </div>
    <div class="stat-card danger clickable animate-slide-up" style="animation-delay: 0.2s;" onclick="goToDatasets('vencidos')" title="Ver vencidos">
      <div class="stat-card-header">
        <span class="stat-card-label">Vencidos</span>
        <div class="stat-card-icon danger">${iconVencido}</div>
      </div>
      <div class="stat-card-value" data-target="${totalVencidos}">0</div>
    </div>
  `;
  
  setTimeout(() => {
    container.querySelectorAll('.stat-card-value').forEach(el => {
      const target = parseInt(el.dataset.target) || 0;
      animateCounter(el, target, 800);
    });
  }, 300);
}

function goToDatasets(estado) {
  if (estado) {
    window.location.href = `datasets.html?estado=${estado}`;
  } else {
    window.location.href = 'datasets.html';
  }
}

function renderDonutChart(stats) {
  const ctx = document.getElementById('donut-chart').getContext('2d');
  const totalVencidos = (stats.atrasados || 0) + (stats.sinRespuesta || 0);
  
  const data = {
    labels: ['Actualizados', 'Próximos a vencer', 'Vencidos'],
    datasets: [{
      data: [stats.actualizados || 0, stats.proximos || 0, totalVencidos],
      backgroundColor: ['#81b3a3', '#f8cf61', '#fc7c7e'],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverOffset: 8
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return ` ${value} datasets (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  if (donutChart) donutChart.destroy();
  
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
  });
  
  renderChartLegend(stats, totalVencidos);
}

function renderChartLegend(stats, totalVencidos) {
  const total = stats.total || 1;
  const container = document.getElementById('chart-legend');
  
  const items = [
    { label: 'Actualizados', value: stats.actualizados || 0, color: '#81b3a3' },
    { label: 'Próximos a vencer', value: stats.proximos || 0, color: '#f8cf61' },
    { label: 'Vencidos', value: totalVencidos, color: '#fc7c7e' }
  ];
  
  container.innerHTML = items.map(item => {
    const pct = Math.round((item.value / total) * 100);
    return `
      <div class="legend-item">
        <span class="legend-color" style="background: ${item.color};"></span>
        <span class="legend-label">${item.label}</span>
        <span class="legend-value">${item.value} (${pct}%)</span>
      </div>
    `;
  }).join('');
}

function renderAlertas(datasets) {
  const vencidos = datasets
    .filter(d => {
      const estado = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      return estado === 'atrasado' || estado === 'sin-respuesta';
    })
    .sort((a, b) => new Date(a.proxima_actualizacion) - new Date(b.proxima_actualizacion));

  const proximos = datasets
    .filter(d => Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion) === 'proximo')
    .sort((a, b) => new Date(a.proxima_actualizacion) - new Date(b.proxima_actualizacion));

  const mostrarInicial = 3;

  // Renderizar vencidos
  const alertasContainer = document.getElementById('alertas-list');
  if (vencidos.length) {
    const hayMas = vencidos.length > mostrarInicial;
    
    let html = vencidos.map((d, index) => {
      const dias = Math.abs(Utils.getDiasRestantes(d.proxima_actualizacion));
      const estado = Utils.calcularEstado(d.proxima_actualizacion, d.frecuencia_dias, d.tipo_gestion);
      const estadoTexto = Utils.getEstadoTexto(estado);
      const estadoClase = Utils.getEstadoClase(estado);
      const oculto = index >= mostrarInicial ? 'style="display: none;"' : '';
      const itemClass = estado === 'atrasado' ? 'atrasado' : 'sin-respuesta';
      const delay = Math.min(index, 2) * 0.1;
      
      return `
        <a href="dataset.html?id=${d.id}" class="alert-item ${itemClass} animate-fade-in-item" data-index="${index}" ${oculto} style="animation-delay: ${delay}s;">
          <div>
            <div class="alert-item-title">${Utils.escapeHtml(d.titulo)}</div>
            <div class="alert-item-meta">${dias} días de atraso</div>
          </div>
          <span class="badge ${estadoClase}">${estadoTexto}</span>
        </a>
      `;
    }).join('');
    
    if (hayMas) {
      html += `
        <button id="btn-ver-mas-atrasados" class="btn-ver-mas" onclick="toggleAtrasados()">
          Ver más (${vencidos.length - mostrarInicial} restantes)
        </button>
      `;
    }
    
    alertasContainer.innerHTML = html;
  } else {
    alertasContainer.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #22c55e; margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p class="text-muted">No hay datasets vencidos</p>
      </div>
    `;
  }

  // Renderizar próximos
  const proximosContainer = document.getElementById('proximos-list');
  if (proximos.length) {
    const hayMasProximos = proximos.length > mostrarInicial;
    
    let htmlProximos = proximos.map((d, index) => {
      const dias = Utils.getDiasRestantes(d.proxima_actualizacion);
      const oculto = index >= mostrarInicial ? 'style="display: none;"' : '';
      const delay = Math.min(index, 2) * 0.1;
      
      return `
        <a href="dataset.html?id=${d.id}" class="alert-item proximo animate-fade-in-item" data-index="${index}" ${oculto} style="animation-delay: ${delay}s;">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #3b82f6; margin-bottom: 0.5rem;"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
        <p class="text-muted">No hay datasets próximos a vencer</p>
      </div>
    `;
  }
}

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
  
  btn.textContent = estanOcultos ? 'Ver menos' : `Ver más (${items.length - mostrarInicial} restantes)`;
}

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
  
  btn.textContent = estanOcultos ? 'Ver menos' : `Ver más (${items.length - mostrarInicial} restantes)`;
}

// === CALENDARIO DE VENCIMIENTOS ===
function renderCalendarChart(datasets) {
  const canvas = document.getElementById('calendar-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Generar los próximos 12 meses (desde el mes siguiente)
  const meses = [];
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  
  for (let i = 1; i <= 12; i++) {
    const fecha = new Date(anioActual, mesActual + i, 1);
    meses.push({
      mes: fecha.getMonth(),
      anio: fecha.getFullYear(),
      label: fecha.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '') + ' ' + fecha.getFullYear().toString().slice(-2),
      inicio: new Date(fecha.getFullYear(), fecha.getMonth(), 1),
      fin: new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59)
    });
  }
  
  // Contar vencimientos por mes (solo datasets con frecuencia definida)
  const vencimientosPorMes = meses.map(m => {
    return datasets.filter(d => {
      if (!d.proxima_actualizacion || d.frecuencia_dias === null) return false;
      const fechaVenc = new Date(d.proxima_actualizacion);
      return fechaVenc >= m.inicio && fechaVenc <= m.fin;
    }).length;
  });
  
  // Colores según cantidad de vencimientos (valores fijos)
  const colores = vencimientosPorMes.map(v => {
    if (v === 0) return '#faffff';       // (sin vencimientos)
    if (v === 1) return '#b9e4df';       // (1)
    if (v <= 3) return '#72c8c1';        // (2-3)
    if (v <= 7) return '#4bb0a9';        // (4-7)
    return '#329b93';                    // (8+ vencimientos)
  });
  
  const data = {
    labels: meses.map(m => m.label),
    datasets: [{
      label: 'Datasets a vencer',
      data: vencimientosPorMes,
      backgroundColor: colores,
      borderColor: colores.map(c => c),
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function(context) {
            const idx = context[0].dataIndex;
            const m = meses[idx];
            return new Date(m.anio, m.mes, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
          },
          label: function(context) {
            const value = context.raw;
            return value === 1 ? ' 1 dataset vence' : ` ${value} datasets vencen`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11 },
          color: '#6b7280'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#374151'
        },
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        const m = meses[idx];
        const mesParam = `${m.anio}-${String(m.mes + 1).padStart(2, '0')}`;
        window.location.href = `datasets.html?mes=${mesParam}`;
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }
  };
  
  if (calendarChart) calendarChart.destroy();
  
  calendarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  });
}
