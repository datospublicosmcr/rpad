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

export default router;
