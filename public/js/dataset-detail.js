// Dataset Detail - Lógica
document.addEventListener('DOMContentLoaded', async () => {
  await loadDataset();
});

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

  // Cargar card blockchain (no bloqueante)
  cargarBlockchainCard(d.id);

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
  
  // Formatos vienen como string concatenado desde el backend
  document.getElementById('info-formatos').textContent = d.formatos || '-';
  
  // Tipo de gestión
  document.getElementById('info-tipo-gestion').textContent = Utils.getTipoGestionTexto(d.tipo_gestion);
}

// ====================
// FUNCIONES AUXILIARES
// ====================

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return { id: params.get('id') };
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function calcularEstado(proximaActualizacion, frecuenciaDias, tipoGestion) {
  if (!proximaActualizacion) return 'eventual';
  if (frecuenciaDias === null) return 'eventual';

  const hoy = new Date();
  const fechaStr = proximaActualizacion.split('T')[0];
  const [year, month, day] = fechaStr.split('-').map(Number);

  const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const proximaUTC = Date.UTC(year, month - 1, day);
  const diffDias = Math.round((proximaUTC - hoyUTC) / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    return tipoGestion === 'interna' ? 'atrasado' : 'sin-respuesta';
  } else if (diffDias <= 60) {
    return 'proximo';
  }
  return 'actualizado';
}

function getEstadoTextoLargo(estado) {
  const textos = {
    'actualizado': 'Actualizado',
    'proximo': 'Próximo a vencer',
    'atrasado': 'Atrasado',
    'sin-respuesta': 'Sin respuesta',
    'eventual': 'Actualización eventual'
  };
  return textos[estado] || estado;
}

function getEstadoClase(estado) {
  const clases = {
    'actualizado': 'badge-success',
    'proximo': 'badge-warning',
    'atrasado': 'badge-danger',
    'sin-respuesta': 'badge-sin-respuesta',
    'eventual': 'badge-secondary'
  };
  return clases[estado] || 'badge-secondary';
}

function getTipoGestionTexto(tipo) {
  const tipos = {
    'interna': 'Gestión Interna',
    'externa': 'Gestión Externa'
  };
  return tipos[tipo] || tipo;
}

// =====================================================
// Card de certificación blockchain
// =====================================================

async function cargarBlockchainCard(datasetId) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/blockchain/dataset/${datasetId}`);
    const data = await response.json();

    if (!data.success || data.data.total === 0) return;

    renderBlockchainCard(data.data);
  } catch (error) {
    // No mostrar nada si falla — la card es complementaria
    console.error('Error cargando blockchain card:', error);
  }
}

function renderBlockchainCard(data) {
  const container = document.getElementById('blockchain-card');
  if (!container) return;

  const ultimoCambio = data.ultimo_cambio;
  const ultimoArchivo = data.ultimo_archivo;

  // Determinar operacion para mostrar
  const tipoOperacionLabels = {
    'cambio_dataset': 'Operacion sobre dataset',
    'certificacion_archivo': 'Certificacion de archivo',
    'sello_fundacional': 'Sello fundacional'
  };

  // Registro principal a mostrar (ultimo cambio o ultimo archivo)
  const principal = ultimoCambio || ultimoArchivo;
  if (!principal) return;

  const fecha = principal.confirmed_at
    ? new Date(principal.confirmed_at).toLocaleDateString('es-AR')
    : '-';

  let html = `
    <div class="blockchain-card-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
      <div>
        <h4>Certificacion Blockchain</h4>
        <p>Registrado en Blockchain Federal Argentina</p>
      </div>
    </div>
    <div class="blockchain-card-body">`;

  // Ultima operacion
  if (ultimoCambio) {
    html += `
      <div class="blockchain-row">
        <span class="blockchain-row-label">Ultima operacion</span>
        <span class="blockchain-row-value">
          <span class="badge badge-primary" style="font-size:0.7rem">${escapeHtml(tipoOperacionLabels[ultimoCambio.tipo] || ultimoCambio.tipo)}</span>
        </span>
      </div>`;
  }

  html += `
      <div class="blockchain-row">
        <span class="blockchain-row-label">Fecha de registro</span>
        <span class="blockchain-row-value">${fecha}</span>
      </div>`;

  if (principal.block_number) {
    html += `
      <div class="blockchain-row">
        <span class="blockchain-row-label">Bloque BFA</span>
        <span class="blockchain-row-value">#${principal.block_number.toLocaleString('es-AR')}</span>
      </div>`;
  }

  html += `
      <div class="blockchain-row">
        <span class="blockchain-row-label">Verificacion</span>
        <span class="blockchain-row-value">
          <span class="badge badge-success" style="font-size:0.7rem">Doble verificacion</span>
        </span>
      </div>`;

  // Hashes
  html += '<div class="blockchain-hash-group">';

  if (ultimoCambio && ultimoCambio.hash_sellado) {
    html += `
      <div class="blockchain-hash-item">
        <div class="blockchain-hash-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          Hash de operacion
        </div>
        <div class="blockchain-hash-value" title="Clic para copiar" onclick="copiarHash(this, '${ultimoCambio.hash_sellado}')">${ultimoCambio.hash_sellado}</div>
        <div class="blockchain-hash-hint">Certifica que el cambio paso por doble verificacion</div>
      </div>`;
  }

  if (ultimoArchivo && ultimoArchivo.hash_sellado) {
    html += `
      <div class="blockchain-hash-item">
        <div class="blockchain-hash-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          Hash de archivo
        </div>
        <div class="blockchain-hash-value" title="Clic para copiar" onclick="copiarHash(this, '${ultimoArchivo.hash_sellado}')">${ultimoArchivo.hash_sellado}</div>
        <div class="blockchain-hash-hint">Certifica el contenido del archivo de datos</div>
      </div>`;
  }

  html += '</div>';

  // Nota de alcance
  html += `
      <p class="blockchain-nota">
        La certificacion blockchain garantiza la integridad del registro, no la calidad de los datos.
      </p>
    </div>`;

  // Footer con link a verificar
  const hashParaVerificar = (ultimoCambio && ultimoCambio.hash_sellado) || (ultimoArchivo && ultimoArchivo.hash_sellado);
  if (hashParaVerificar) {
    html += `
    <div class="blockchain-card-footer">
      <a href="verificar.html?hash=${hashParaVerificar}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
        Verificar integridad
      </a>
    </div>`;
  }

  container.innerHTML = html;
  container.classList.remove('hidden');
}

function copiarHash(element, hash) {
  navigator.clipboard.writeText(hash).then(() => {
    const original = element.textContent;
    element.textContent = 'Copiado!';
    element.style.background = 'var(--success-light)';
    element.style.borderColor = 'var(--success)';
    setTimeout(() => {
      element.textContent = original;
      element.style.background = '';
      element.style.borderColor = '';
    }, 1500);
  });
}
