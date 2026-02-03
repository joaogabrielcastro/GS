import { Router } from 'express';
import { occurrenceController } from '../controllers/occurrenceController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  '/upload-photos',
  authorize('MOTORISTA'),
  upload.array('photos', 5),
  occurrenceController.uploadPhotos
);

router.post('/', authorize('MOTORISTA'), occurrenceController.create);
router.get('/', occurrenceController.list);
router.get('/statistics', occurrenceController.getStatistics);
router.get('/:id', occurrenceController.getById);
router.put(
  '/:id/status',
  authorize('ADMINISTRADOR', 'FINANCEIRO'),
  occurrenceController.updateStatus
);

export default router;
