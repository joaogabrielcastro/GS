import { Router } from 'express';
import { truckController } from '../controllers/truckController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/', authorize('ADMINISTRADOR'), truckController.create);
router.get('/', truckController.list);
router.get('/:id', truckController.getById);
router.put('/:id', authorize('ADMINISTRADOR'), truckController.update);
router.post('/:id/assign-driver', authorize('ADMINISTRADOR'), truckController.assignDriver);
router.delete('/:id', authorize('ADMINISTRADOR'), truckController.delete);
router.get('/:id/history', truckController.getHistory);

export default router;
