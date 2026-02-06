// Correos - Sistema de Notificaciones por Email
// Funciones para verificar SMTP, preview y envío de alertas

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // Solo administradores pueden acceder
  if (!Auth.isAdmin()) {
    window.location.href = 'index.html';
    return;
  }
});

// =====================================================
// VERIFICAR CONEXIÓN SMTP
// =====================================================

async function verificarConexionSMTP() {
  const statusEl = document.getElementById('smtp-status');
  const btnVerificar = document.querySelector('[onclick="verificarConexionSMTP()"]');
  
  statusEl.innerHTML = '<span class="spinner-inline"></span> Verificando...';
  statusEl.className = 'smtp-status checking';
  if (btnVerificar) btnVerificar.disabled = true;

  try {
    const res = await API.verificarSmtp();
    if (res.success) {
      statusEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Conexión SMTP exitosa';
      statusEl.className = 'smtp-status success';
      if (typeof showToast === 'function') {
        showToast('Conexión SMTP verificada correctamente', 'success');
      }
    } else {
      const errorMsg = res.error || res.message || 'Error desconocido';
      const errorCode = res.code ? ` (${res.code})` : '';
      statusEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg> Error: ' + errorMsg + errorCode;
      statusEl.className = 'smtp-status error';
      if (typeof showToast === 'function') {
        showToast('Error SMTP: ' + errorMsg + errorCode, 'error');
      }
    }
  } catch (error) {
    statusEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg> Error de conexión';
    statusEl.className = 'smtp-status error';
    if (typeof showToast === 'function') {
      showToast('Error: ' + error.message, 'error');
    }
  } finally {
    if (btnVerificar) btnVerificar.disabled = false;
  }
}

// =====================================================
// PREVIEW DE EMAIL
// =====================================================

async function verPreviewEmail() {
  const tipo = document.getElementById('tipo-notificacion').value;
  const btnPreview = document.querySelector('[onclick="verPreviewEmail()"]');
  
  if (btnPreview) {
    btnPreview.disabled = true;
    btnPreview.innerHTML = '<span class="spinner-inline"></span> Cargando...';
  }

  try {
    const htmlContent = await API.previewNotificacion(tipo);
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast('Error al generar preview: ' + error.message, 'error');
    }
  } finally {
    if (btnPreview) {
      btnPreview.disabled = false;
      btnPreview.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Preview';
    }
  }
}

// =====================================================
// ENVIAR EMAIL DE PRUEBA
// =====================================================

async function enviarEmailPrueba() {
  const tipo = document.getElementById('tipo-notificacion').value;
  const selectEl = document.getElementById('tipo-notificacion');
  const tipoTexto = selectEl.options[selectEl.selectedIndex].text;
  const btnEnviar = document.querySelector('[onclick="enviarEmailPrueba()"]');
  
  // Mostrar modal de confirmación
  const confirmar = confirm(`⚠️ Esto enviará un email REAL a los destinatarios configurados.\n\nTipo: ${tipoTexto}\n\n¿Continuar?`);
  
  if (!confirmar) return;

  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-inline"></span> Enviando...';
  }

  try {
    if (typeof showToast === 'function') {
      showToast('Enviando email...', 'info');
    }
    
    const res = await API.enviarNotificacionPrueba(tipo);
    
    if (res.success) {
      const cantidad = res.datasetsEncontrados || res.areasNotificadas?.length || 0;
      if (typeof showToast === 'function') {
        showToast(`Email enviado correctamente. Datasets encontrados: ${cantidad}`, 'success');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast(res.message || 'Error al enviar email', 'error');
      }
    }
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast('Error: ' + error.message, 'error');
    }
  } finally {
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> Enviar Email Real';
    }
  }
}