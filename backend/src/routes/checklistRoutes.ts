import { Router } from 'express';
import { checklistController } from '../controllers/checklistController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  '/upload-photos',
  authorize('MOTORISTA'),
  upload.fields([
    { name: 'cabinPhoto', maxCount: 1 },
    { name: 'tiresPhoto', maxCount: 1 },
    { name: 'canvasPhoto', maxCount: 1 },
  ]),
  checklistController.uploadPhotos
);

router.post('/', authorize('MOTORISTA'), checklistController.create);
router.get('/', checklistController.list);
router.get('/:id', checklistController.getById);

export default router;
