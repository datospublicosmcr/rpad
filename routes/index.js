import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

// Controladores
import { login, verifySession, changePassword } from '../controllers/authController.js';
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
  previewEmail 
} from '../controllers/notificacionesController.js';
import {
  reporteEstadoGeneral,
  reporteHistorialNotificaciones,
  reportePorArea,
  reporteCumplimiento
} from '../controllers/reportesController.js';
import { generarNota } from '../controllers/notasController.js';

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

// =====================================================
// Rutas protegidas (requieren autenticación)
// =====================================================

// Auth
router.get('/auth/verify', authMiddleware, verifySession);
router.post('/auth/change-password', authMiddleware, changePassword);

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
// Notificaciones (protegidas)
// =====================================================
router.get('/notificaciones/ejecutar', authMiddleware, ejecutarNotificacionesDiarias);
router.get('/notificaciones/prueba/:tipo', authMiddleware, pruebaNotificacion);
router.get('/notificaciones/verificar-smtp', authMiddleware, verificarSMTP);
router.get('/notificaciones/preview/:tipo', authMiddleware, previewEmail);

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

export default router;
