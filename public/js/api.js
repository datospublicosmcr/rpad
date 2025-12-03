// Servicio de API
const API = {
  // === DATASETS ===
  async getDatasets(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.tema) params.append('tema', filtros.tema);
    if (filtros.frecuencia) params.append('frecuencia', filtros.frecuencia);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

    const url = `${CONFIG.API_URL}/datasets${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  },

  async getDataset(id) {
    const response = await fetch(`${CONFIG.API_URL}/datasets/${id}`);
    const data = await response.json();
    return data.data;
  },

  async getEstadisticas() {
    const response = await fetch(`${CONFIG.API_URL}/datasets/estadisticas`);
    const data = await response.json();
    return data.data;
  },

  async createDataset(dataset) {
    const response = await fetch(`${CONFIG.API_URL}/datasets`, {
      method: 'POST',
      headers: Auth.getAuthHeaders(),
      body: JSON.stringify(dataset)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al crear dataset');
    return data.data;
  },

  async updateDataset(id, dataset) {
    const response = await fetch(`${CONFIG.API_URL}/datasets/${id}`, {
      method: 'PUT',
      headers: Auth.getAuthHeaders(),
      body: JSON.stringify(dataset)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al actualizar dataset');
    return data.data;
  },

  async deleteDataset(id) {
    const response = await fetch(`${CONFIG.API_URL}/datasets/${id}`, {
      method: 'DELETE',
      headers: Auth.getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al eliminar dataset');
    return data;
  },

  async registrarActualizacion(id) {
    const response = await fetch(`${CONFIG.API_URL}/datasets/${id}/actualizar`, {
      method: 'POST',
      headers: Auth.getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al registrar actualización');
    return data.data;
  },

  // === CATÁLOGOS ===
  async getTemas() {
    const response = await fetch(`${CONFIG.API_URL}/catalogos/temas`);
    const data = await response.json();
    return data.data || [];
  },

  async getFrecuencias() {
    const response = await fetch(`${CONFIG.API_URL}/catalogos/frecuencias`);
    const data = await response.json();
    return data.data || [];
  },

  async getFormatos() {
    const response = await fetch(`${CONFIG.API_URL}/catalogos/formatos`);
    const data = await response.json();
    return data.data || [];
  }
};

// === UTILIDADES ===
const Utils = {
  // Formatear fecha
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Calcular estado del dataset
  calcularEstado(proximaActualizacion, frecuenciaDias) {
    if (frecuenciaDias === null) return 'actualizado'; // Eventual
    if (!proximaActualizacion) return 'sin-fecha';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const proxima = new Date(proximaActualizacion);
    proxima.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((proxima - hoy) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'atrasado';
    if (diffDias <= 60) return 'proximo';
    return 'actualizado';
  },

  // Días restantes o de atraso
  getDiasRestantes(proximaActualizacion) {
    if (!proximaActualizacion) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const proxima = new Date(proximaActualizacion);
    proxima.setHours(0, 0, 0, 0);
    return Math.floor((proxima - hoy) / (1000 * 60 * 60 * 24));
  },

  // Texto del estado
  getEstadoTexto(estado) {
    const textos = {
      'actualizado': 'Actualizado',
      'proximo': 'Próximo a vencer',
      'atrasado': 'Atrasado',
      'sin-fecha': 'Sin fecha'
    };
    return textos[estado] || estado;
  },

  // Clase CSS del estado
  getEstadoClase(estado) {
    const clases = {
      'actualizado': 'badge-success',
      'proximo': 'badge-warning',
      'atrasado': 'badge-danger',
      'sin-fecha': 'badge-secondary'
    };
    return clases[estado] || 'badge-secondary';
  },

  // Escapar HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Truncar texto
  truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Obtener parámetros de URL
  getUrlParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  // Mostrar mensaje de error
  showError(message) {
    const container = document.getElementById('message-container');
    if (container) {
      container.innerHTML = `<div class="alert alert-error">${this.escapeHtml(message)}</div>`;
      setTimeout(() => container.innerHTML = '', 5000);
    } else {
      alert(message);
    }
  },

  // Mostrar mensaje de éxito
  showSuccess(message) {
    const container = document.getElementById('message-container');
    if (container) {
      container.innerHTML = `<div class="alert alert-success">${this.escapeHtml(message)}</div>`;
      setTimeout(() => container.innerHTML = '', 5000);
    }
  }
};
