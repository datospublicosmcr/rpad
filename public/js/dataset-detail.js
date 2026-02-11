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
  const str = String(dateString).substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return dateString;
  const [y, m, d] = str.split('-');
  return d + '/' + m + '/' + y;
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

  const tipoLabels = {
    'cambio_dataset': 'Cambio de dataset',
    'certificacion_archivo': 'Certificacion de archivo',
    'sello_fundacional': 'Sello fundacional'
  };

  const principal = ultimoCambio || ultimoArchivo;
  if (!principal) return;

  const fecha = principal.confirmed_at
    ? new Date(principal.confirmed_at).toLocaleDateString('es-AR')
    : '-';

  const tipoTexto = ultimoCambio ? (tipoLabels[ultimoCambio.tipo] || ultimoCambio.tipo) : '-';
  const bloque = principal.block_number ? `#${principal.block_number.toLocaleString('es-AR')}` : '-';

  // Header con fondo azul oscuro y logo BFA
  let html = `
    <div class="bc-header">
      <div class="bc-header-left">
        <a href="https://bfa.ar/" target="_blank" rel="noopener noreferrer"><img src="img/bfa.svg" alt="BFA" class="bc-header-logo"></a>
        <div class="bc-header-text">
          <span class="bc-header-title">Certificación Blockchain</span>
          <span class="bc-header-subtitle">Blockchain Federal Argentina</span>
        </div>
      </div>
      <span class="bc-badge-verificado">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Verificado en BFA
      </span>
    </div>`;

  // Cuerpo: metadata en fila horizontal
  html += `
    <div class="bc-body">
      <div class="bc-meta-row">
        <div class="bc-meta-item">
          <span class="bc-meta-label">Operacion</span>
          <span class="bc-meta-value">${escapeHtml(tipoTexto)}</span>
        </div>
        <div class="bc-meta-item">
          <span class="bc-meta-label">Fecha</span>
          <span class="bc-meta-value">${fecha}</span>
        </div>
        <div class="bc-meta-item">
          <span class="bc-meta-label">Bloque BFA</span>
          <span class="bc-meta-value">${bloque}</span>
        </div>
      </div>`;

  // Hashes compactos con boton copiar
  if (ultimoCambio && ultimoCambio.hash_sellado) {
    html += `
      <div class="bc-hash-row">
        <span class="bc-hash-label">Hash operacion</span>
        <span class="bc-hash-value" title="${ultimoCambio.hash_sellado}">${ultimoCambio.hash_sellado}</span>
        <button class="bc-copy-btn" title="Copiar hash" onclick="copiarHash(this, '${ultimoCambio.hash_sellado}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>`;
  }

  // Mostrar todos los archivos certificados
  const archivosCertificados = data.archivos_certificados || [];
  if (archivosCertificados.length > 0) {
    for (const archivo of archivosCertificados) {
      const nombreArchivo = archivo.filename ? escapeHtml(archivo.filename) : 'Archivo sin nombre';
      const fechaArchivo = archivo.confirmed_at
        ? new Date(archivo.confirmed_at).toLocaleDateString('es-AR')
        : '';
      html += `
      <div class="bc-hash-row">
        <span class="bc-hash-label">Archivo: ${nombreArchivo}${fechaArchivo ? ' (' + fechaArchivo + ')' : ''}</span>
        <span class="bc-hash-value" title="${archivo.file_hash}">${archivo.file_hash}</span>
        <button class="bc-copy-btn" title="Copiar hash" onclick="copiarHash(this, '${archivo.file_hash}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>`;
    }
  } else if (ultimoArchivo && ultimoArchivo.file_hash) {
    // Fallback para compatibilidad con datos sin archivos_certificados
    html += `
      <div class="bc-hash-row">
        <span class="bc-hash-label">Hash archivo</span>
        <span class="bc-hash-value" title="${ultimoArchivo.file_hash}">${ultimoArchivo.file_hash}</span>
        <button class="bc-copy-btn" title="Copiar hash" onclick="copiarHash(this, '${ultimoArchivo.file_hash}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>`;
  }

  html += `</div>`;

  // QR de verificación — generar uno por cada hash disponible
  if (typeof qrcode !== 'undefined') {
    const qrItems = [];

    // QR para hash de operación
    if (ultimoCambio && ultimoCambio.hash_sellado) {
      const fechaCambio = ultimoCambio.confirmed_at
        ? new Date(ultimoCambio.confirmed_at).toLocaleDateString('es-AR')
        : '';
      qrItems.push({
        hash: ultimoCambio.hash_sellado,
        label: 'Hash operación',
        fecha: fechaCambio
      });
    }

    // QR para cada archivo certificado
    const archivosCert = data.archivos_certificados || [];
    if (archivosCert.length > 0) {
      for (const archivo of archivosCert) {
        const nombreArch = archivo.filename || 'Archivo';
        const fechaArch = archivo.confirmed_at
          ? new Date(archivo.confirmed_at).toLocaleDateString('es-AR')
          : '';
        qrItems.push({
          hash: archivo.file_hash,
          label: `Archivo: ${nombreArch}`,
          fecha: fechaArch
        });
      }
    } else if (ultimoArchivo && ultimoArchivo.file_hash) {
      // Fallback: archivo único sin array
      const fechaArch = ultimoArchivo.confirmed_at
        ? new Date(ultimoArchivo.confirmed_at).toLocaleDateString('es-AR')
        : '';
      qrItems.push({
        hash: ultimoArchivo.file_hash,
        label: ultimoArchivo.filename ? `Archivo: ${ultimoArchivo.filename}` : 'Hash archivo',
        fecha: fechaArch
      });
    }

    if (qrItems.length > 0) {
      let qrHtml = qrItems.map(item => {
        const qr = qrcode(0, 'M');
        qr.addData(`${window.location.origin}/verificar.html?hash=${item.hash}`);
        qr.make();
        return `
          <div class="bc-qr-item">
            ${qr.createSvgTag({ cellSize: 3, margin: 0 })}
            <span class="bc-qr-label">${escapeHtml(item.label)}</span>
            ${item.fecha ? `<span class="bc-qr-fecha">${item.fecha}</span>` : ''}
          </div>
        `;
      }).join('');

      html += `
        <div class="bc-qr-section">
          <div class="bc-qr-grid">
            ${qrHtml}
          </div>
        </div>`;
    }
  }

  // Footer: texto explicativo + links verificar y BFA
  const hashParaVerificar = (ultimoCambio && ultimoCambio.hash_sellado) || (ultimoArchivo && ultimoArchivo.hash_sellado);
  const hashBFA = hashParaVerificar ? hashParaVerificar.replace('0x', '') : null;
  html += `
    <div class="bc-footer">
      <p class="bc-footer-nota">Blockchain Federal Argentina (BFA) es una red blockchain pública argentina administrada por organismos públicos. Cada operación aprobada en RPAD genera un hash SHA-256 que se sella en BFA, creando un registro inmutable y verificable públicamente. El hash no contiene datos personales ni del contenido — es una huella digital irreversible que certifica que el registro existió en un momento dado.</p>
      ${hashParaVerificar ? `<div class="bc-footer-actions"><a href="verificar.html?hash=${hashParaVerificar}" class="bc-footer-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
        Verificar integridad
      </a><a href="https://bfa.escribanodigital.ar//verificar#/hash/${hashBFA}" target="_blank" rel="noopener noreferrer" class="bc-footer-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        Ver en BFA
      </a></div>` : ''}
    </div>`;

  container.innerHTML = html;
  container.classList.remove('hidden');
}

function copiarHash(btn, hash) {
  navigator.clipboard.writeText(hash).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
    }, 1500);
  });
}
