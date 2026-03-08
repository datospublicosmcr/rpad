import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

// Controladores
import { login, verifySession, changePassword, updateProfile, getProfile } from '../controllers/authController.js';
import { 
  getDatasets, 
  getDatasetById, 
  createDataset, 
  updateDataset, 
  deleteDataset,
  getEstadisticas,
  registrarActualizacion
} from '../controllers/datasetController.js';
import { getTemas, getFrecuencias, getFormatos } from '../controllers/catalogController.js';
import { fetchFromAndino } from '../controllers/andinoController.js';
import { 
  getAreas, 
  getAreaById, 
  createArea, 
  updateArea, 
  deleteArea 
} from '../controllers/areasController.js';
import { 
  ejecutarNotificacionesDiarias,
  pruebaNotificacion,
  verificarSMTP,
  previewEmail,
  ejecutarNotificacionCambiosPendientes,
  previewCambiosPendientes
} from '../controllers/notificacionesController.js';
import {
  reporteEstadoGeneral,
  reporteHistorialNotificaciones,
  reportePorArea,
  reporteCumplimiento
} from '../controllers/reportesController.js';
import { generarNota } from '../controllers/notasController.js';
import {
  getContadorPendientes,
  getCambiosPendientesParaRevisar,
  getMisCambios,
  getCambioPendienteById,
  verificarDatasetBloqueado,
  aprobarCambio,
  rechazarCambio,
  getDatasetsConPendientes
} from '../controllers/cambiosPendientesController.js';
import { enviarContacto } from '../controllers/contactoController.js';
import {
  getMetricasAutomaticas,
  getMetricasManuales,
  createMetricaManual,
  deleteMetricaManual,
  getProyectos,
  getProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  createHito,
  updateHito,
  deleteHito,
  getTimeline,
  exportarMetricasCSV
} from '../controllers/gestionController.js';

const router = Router();

// =====================================================
// Rutas públicas (sin autenticación)
// =====================================================

// Auth
router.post('/auth/login', login);

// Datasets (lectura)
router.get('/datasets', getDatasets);
router.get('/datasets/estadisticas', getEstadisticas);
router.get('/datasets/:id', getDatasetById);

// Catálogos
router.get('/catalogos/temas', getTemas);
router.get('/catalogos/frecuencias', getFrecuencias);
router.get('/catalogos/formatos', getFormatos);

// Áreas (lectura pública para selects)
router.get('/areas', getAreas);
router.get('/areas/:id', getAreaById);

// Andino (Portal de Datos Abiertos)
router.get('/andino/fetch', fetchFromAndino);

// Contacto (público con rate limiting)
router.post('/contacto', enviarContacto);

// =====================================================
// Rutas protegidas (requieren autenticación)
// =====================================================

// Auth
router.get('/auth/verify', authMiddleware, verifySession);
router.post('/auth/change-password', authMiddleware, changePassword);

// Perfil
router.get('/auth/profile', authMiddleware, getProfile);
router.put('/auth/profile', authMiddleware, updateProfile);

// Datasets (escritura)
router.post('/datasets', authMiddleware, createDataset);
router.put('/datasets/:id', authMiddleware, updateDataset);
router.delete('/datasets/:id', authMiddleware, deleteDataset);
router.post('/datasets/:id/actualizar', authMiddleware, registrarActualizacion);

// Áreas (escritura)
router.post('/areas', authMiddleware, createArea);
router.put('/areas/:id', authMiddleware, updateArea);
router.delete('/areas/:id', authMiddleware, deleteArea);

// =====================================================
// Cambios Pendientes (protegidas - solo admin)
// =====================================================
router.get('/cambios-pendientes/contador', authMiddleware, getContadorPendientes);
router.get('/cambios-pendientes/para-revisar', authMiddleware, getCambiosPendientesParaRevisar);
router.get('/cambios-pendientes/mis-cambios', authMiddleware, getMisCambios);
router.get('/cambios-pendientes/datasets-bloqueados', authMiddleware, getDatasetsConPendientes);
router.get('/cambios-pendientes/:id', authMiddleware, getCambioPendienteById);
router.get('/cambios-pendientes/verificar/:datasetId', authMiddleware, verificarDatasetBloqueado);
router.post('/cambios-pendientes/:id/aprobar', authMiddleware, aprobarCambio);
router.post('/cambios-pendientes/:id/rechazar', authMiddleware, rechazarCambio);

// =====================================================
// Notificaciones (protegidas)
// =====================================================
router.get('/notificaciones/ejecutar', authMiddleware, ejecutarNotificacionesDiarias);
router.get('/notificaciones/prueba/:tipo', authMiddleware, pruebaNotificacion);
router.get('/notificaciones/verificar-smtp', authMiddleware, verificarSMTP);
router.get('/notificaciones/preview/:tipo', authMiddleware, previewEmail);
router.get('/notificaciones/cambios-pendientes', ejecutarNotificacionCambiosPendientes);
router.get('/notificaciones/preview-cambios-pendientes', authMiddleware, previewCambiosPendientes);

// =====================================================
// Reportes PDF (protegidas)
// =====================================================
router.get('/reportes/estado-general', authMiddleware, reporteEstadoGeneral);
router.get('/reportes/historial-notificaciones', authMiddleware, reporteHistorialNotificaciones);
router.get('/reportes/por-area/:areaId', authMiddleware, reportePorArea);
router.get('/reportes/cumplimiento', authMiddleware, reporteCumplimiento);

// =====================================================
// Notas DOCX (protegidas)
// =====================================================
router.post('/notas/generar', authMiddleware, generarNota);

// =====================================================
// Cron (protegido por clave secreta)
// =====================================================
router.get('/cron/notificaciones', (req, res, next) => {
  const secret = req.query.secret || req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, error: 'Acceso denegado' });
  }
  next();
}, ejecutarNotificacionesDiarias);

router.get('/cron/cambios-pendientes', (req, res, next) => {
  const secret = req.query.secret || req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ success: false, error: 'Acceso denegado' });
  }
  next();
}, ejecutarNotificacionCambiosPendientes);

// =====================================================
// Gestión: Métricas y Proyectos (protegidas)
// =====================================================

// Métricas (lectura: todos los autenticados; escritura: solo admin)
router.get('/gestion/metricas', authMiddleware, getMetricasAutomaticas);
router.get('/gestion/metricas/csv', authMiddleware, exportarMetricasCSV);
router.get('/gestion/metricas-manuales', authMiddleware, getMetricasManuales);
router.post('/gestion/metricas-manuales', authMiddleware, adminOnly, createMetricaManual);
router.delete('/gestion/metricas-manuales/:id', authMiddleware, adminOnly, deleteMetricaManual);

// Proyectos (lectura: todos los autenticados; escritura: solo admin)
router.get('/gestion/proyectos', authMiddleware, getProyectos);
router.get('/gestion/proyectos/:id', authMiddleware, getProyectoById);
router.post('/gestion/proyectos', authMiddleware, adminOnly, createProyecto);
router.put('/gestion/proyectos/:id', authMiddleware, adminOnly, updateProyecto);
router.delete('/gestion/proyectos/:id', authMiddleware, adminOnly, deleteProyecto);

// Hitos (solo admin)
router.post('/gestion/proyectos/:proyecto_id/hitos', authMiddleware, adminOnly, createHito);
router.put('/gestion/hitos/:id', authMiddleware, adminOnly, updateHito);
router.delete('/gestion/hitos/:id', authMiddleware, adminOnly, deleteHito);

// Timeline (todos los autenticados)
router.get('/gestion/timeline', authMiddleware, getTimeline);

export default router;
