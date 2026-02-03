import { Router } from 'express';
import { tireController } from '../controllers/tireController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post('/', authorize('ADMINISTRADOR'), tireController.create);
router.get('/', tireController.list);
router.get('/statistics', tireController.getStatistics);
router.get('/alerts', tireController.getAlerts);
router.get('/:id', tireController.getById);
router.put('/:id', authorize('ADMINISTRADOR'), tireController.update);
router.post('/:id/event', authorize('ADMINISTRADOR', 'MOTORISTA'), tireController.registerEvent);
router.delete('/:id', authorize('ADMINISTRADOR'), tireController.delete);

export default router;
