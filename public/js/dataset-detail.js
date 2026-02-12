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

// Formatear fecha de la BD parseando el string directamente (sin new Date()).
// dateStrings: true en la conexión MySQL devuelve strings como "2026-02-06 13:57:25"
// sin timezone — new Date() los interpreta de forma inconsistente entre navegadores.
function formatearFechaDB(fechaStr, soloFecha = false) {
  if (!fechaStr) return '-';
  const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const fechaFormateada = `${match[3]}/${match[2]}/${match[1]}`;
    if (soloFecha) return fechaFormateada;
    return `${fechaFormateada}, ${match[4]}:${match[5]}:${match[6]}`;
  }
  return fechaStr;
}

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

  const tipoLabels = {
    'cambio_dataset': 'Cambio de dataset',
    'certificacion_archivo': 'Certificacion de archivo',
    'sello_fundacional': 'Sello fundacional'
  };

  const registros = data.registros || [];
  if (registros.length === 0) return;

  // Agrupar registros por referencia_id
  const grupos = agruparPorReferencia(registros);
  if (grupos.length === 0) return;

  // El grupo más reciente es el primero (ordenado por referencia_id DESC)
  const ultimoGrupo = grupos[0];
  const cambio = ultimoGrupo.cambio;
  const archivos = ultimoGrupo.archivos;
  const principal = cambio || archivos[0];
  if (!principal) return;

  const fecha = principal.confirmed_at
    ? formatearFechaDB(principal.confirmed_at, true)
    : '-';

  const tipoTexto = cambio ? (tipoLabels[cambio.tipo] || cambio.tipo) : '-';
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

  // Hash de operacion
  if (cambio && cambio.hash_sellado) {
    html += `
      <div class="bc-hash-row">
        <span class="bc-hash-label">Hash operacion</span>
        <span class="bc-hash-value" title="${cambio.hash_sellado}">${cambio.hash_sellado}</span>
        <button class="bc-copy-btn" title="Copiar hash" onclick="copiarHash(this, '${cambio.hash_sellado}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>`;
  }

  // Todos los archivos certificados del grupo
  for (const archivo of archivos) {
    const nombreArchivo = archivo.filename ? escapeHtml(archivo.filename) : 'Archivo sin nombre';
    const fechaArchivo = archivo.confirmed_at
      ? formatearFechaDB(archivo.confirmed_at, true)
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

  html += `</div>`;

  // QR de verificación — uno por cada hash del grupo
  if (typeof qrcode !== 'undefined') {
    const qrItems = [];

    if (cambio && cambio.hash_sellado) {
      qrItems.push({
        hash: cambio.hash_sellado,
        label: 'Hash operación',
        fecha: cambio.confirmed_at ? formatearFechaDB(cambio.confirmed_at, true) : ''
      });
    }

    for (const archivo of archivos) {
      qrItems.push({
        hash: archivo.file_hash,
        label: `Archivo: ${archivo.filename || 'Archivo'}`,
        fecha: archivo.confirmed_at ? formatearFechaDB(archivo.confirmed_at, true) : ''
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

  // Historial expandible — agrupado por referencia_id
  let historialHtml = '';
  if (grupos.length > 0) {
    historialHtml = grupos.map(grupo => {
      const gc = grupo.cambio;
      const ga = grupo.archivos;
      const gPrincipal = gc || ga[0];
      if (!gPrincipal) return '';

      const gFecha = gPrincipal.confirmed_at
        ? formatearFechaDB(gPrincipal.confirmed_at, true)
        : formatearFechaDB(gPrincipal.created_at, true);
      const gTipo = gc ? (tipoLabels[gc.tipo] || gc.tipo) : (tipoLabels[gPrincipal.tipo] || gPrincipal.tipo);
      const gEstado = gPrincipal.estado || 'confirmado';
      const gBadgeClass = gEstado === 'confirmado' ? 'confirmado' : (gEstado === 'error' ? 'error' : 'pendiente');

      // Ícono de candado para hash de operación
      const lockIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
      // Ícono de documento para archivos
      const fileIcon = '<svg class="bc-historial-archivo-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
      // Ícono de copiar
      const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

      let detalle = '';
      if (gc && gc.hash_sellado) {
        const truncHash = truncarHash(gc.hash_sellado);
        // Extraer hora HH:MM del confirmed_at
        const horaMatch = gc.confirmed_at ? gc.confirmed_at.match(/(\d{2}):(\d{2}):\d{2}/) : null;
        const horaTexto = horaMatch ? ` — ${horaMatch[1]}:${horaMatch[2]} hs` : '';
        detalle += `<div class="bc-historial-operacion-block">
          <div class="bc-historial-operacion-desc">${lockIcon}<span>Cambio validado por doble verificación${horaTexto}</span></div>
          <div class="bc-historial-operacion-hash">
            <span class="bc-historial-hash-value" title="${gc.hash_sellado}">${truncHash}</span>
            <button class="bc-historial-copy-btn" onclick="copiarHash(this, '${gc.hash_sellado}')" title="Copiar hash">${copyIcon}</button>
          </div>
        </div>`;
      }
      for (const a of ga) {
        detalle += `<div class="bc-historial-archivo-block">`;
        if (a.filename) {
          detalle += `<div class="bc-historial-archivo-row">${fileIcon}<span class="bc-historial-archivo">${escapeHtml(a.filename)}</span></div>`;
        }
        if (a.file_hash) {
          const truncFileHash = truncarHash(a.file_hash);
          detalle += `<div class="bc-historial-operacion-hash">
            <span class="bc-historial-hash-value" title="${a.file_hash}">${truncFileHash}</span>
            <button class="bc-historial-copy-btn" onclick="copiarHash(this, '${a.file_hash}')" title="Copiar hash">${copyIcon}</button>
          </div>`;
        }
        detalle += `</div>`;
      }

      return `
        <div class="bc-historial-entry">
          <div class="bc-historial-entry-header">
            <span class="bc-historial-tipo">${escapeHtml(gTipo)}</span>
            <span class="bc-historial-fecha">${gFecha}</span>
            <span class="bc-historial-badge ${gBadgeClass}">${gEstado}</span>
          </div>
          ${detalle}
        </div>`;
    }).join('');
  }

  // Sección de historial colapsable
  html += `
    <div class="bc-historial" id="bc-historial">
      <div class="bc-historial-inner">
        <h4 class="bc-historial-title">Historial de certificaciones (${grupos.length} operacion${grupos.length !== 1 ? 'es' : ''})</h4>
        <div class="bc-historial-timeline">
          ${historialHtml || '<p style="font-size:0.78rem;color:var(--gray-500);margin:0;">No hay registros anteriores.</p>'}
        </div>
      </div>
    </div>`;

  // Footer: texto explicativo + botón Ver historial
  html += `
    <div class="bc-footer">
      <p class="bc-footer-nota">Blockchain Federal Argentina (BFA) es una red blockchain pública argentina administrada por organismos públicos. Cada operación aprobada en RPAD genera un hash SHA-256 que se sella en BFA, creando un registro inmutable y verificable públicamente. El hash no contiene datos personales ni del contenido — es una huella digital irreversible que certifica que el registro existió en un momento dado.</p>
      ${grupos.length > 0 ? `<div class="bc-footer-actions"><button onclick="toggleHistorial(this)" class="bc-footer-link" style="cursor:pointer;background:none;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Ver historial
      </button></div>` : ''}
    </div>`;

  container.innerHTML = html;
  container.classList.remove('hidden');
}

// Agrupar registros por referencia_id. Devuelve array de grupos ordenados
// por referencia_id DESC (más reciente primero). Cada grupo tiene:
// { referencia_id, cambio (o null), archivos [] }
// Registros sin referencia_id (ej: sello_fundacional) se agrupan individualmente.
function agruparPorReferencia(registros) {
  const mapaGrupos = new Map();
  let sinRefCounter = 0;

  for (const reg of registros) {
    const key = reg.referencia_id != null ? reg.referencia_id : `_sin_ref_${sinRefCounter++}`;
    if (!mapaGrupos.has(key)) {
      mapaGrupos.set(key, { referencia_id: reg.referencia_id, cambio: null, archivos: [] });
    }
    const grupo = mapaGrupos.get(key);
    if (reg.tipo === 'certificacion_archivo') {
      grupo.archivos.push(reg);
    } else {
      grupo.cambio = reg;
    }
  }

  // Ordenar: referencia_id numérico DESC, sin referencia al final
  return Array.from(mapaGrupos.values()).sort((a, b) => {
    const aRef = a.referencia_id != null ? a.referencia_id : -1;
    const bRef = b.referencia_id != null ? b.referencia_id : -1;
    return bRef - aRef;
  });
}

// Truncar hash para mostrar solo inicio y final
function truncarHash(hash) {
  if (!hash || hash.length <= 16) return hash;
  return hash.slice(0, 10) + '...' + hash.slice(-6);
}

function copiarHash(btn, hash) {
  const iconoOriginal = btn.innerHTML;

  function mostrarCopiado() {
    btn.classList.add('copied');
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = iconoOriginal;
    }, 1500);
  }

  // Fallback para contextos no-seguros (HTTP) donde navigator.clipboard no existe
  function copiarFallback(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      mostrarCopiado();
    } catch (err) {
      console.error('Error al copiar:', err);
    }
    document.body.removeChild(textarea);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(hash).then(mostrarCopiado).catch(() => copiarFallback(hash));
  } else {
    copiarFallback(hash);
  }
}

function toggleHistorial(btn) {
  const historial = document.getElementById('bc-historial');
  if (!historial) return;
  const isOpen = historial.classList.toggle('open');
  btn.innerHTML = isOpen
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Ocultar historial`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Ver historial`;
}
