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
  ejecutarNotificacionesDiarias, 
  pruebaNotificacion, 
  verificarSMTP,
  previewEmail 
} from '../controllers/notificacionesController.js';

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

// =====================================================
// Notificaciones (protegidas)
// =====================================================
router.get('/notificaciones/ejecutar', authMiddleware, ejecutarNotificacionesDiarias);
router.get('/notificaciones/prueba/:tipo', authMiddleware, pruebaNotificacion);
router.get('/notificaciones/verificar-smtp', authMiddleware, verificarSMTP);
router.get('/notificaciones/preview/:tipo', authMiddleware, previewEmail);

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
