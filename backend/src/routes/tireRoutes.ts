import { Router } from 'express';
import { tireController } from '../controllers/tireController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from "../middleware/validate";
import {
  createTireBodySchema,
  listTiresQuerySchema,
  registerTireEventBodySchema,
  tireIdParamSchema,
  tireStatisticsQuerySchema,
  updateTireBodySchema,
} from "../schemas/tireSchemas";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  '/',
  authorize('ADMINISTRADOR'),
  validate({ body: createTireBodySchema }),
  tireController.create,
);
router.get('/', validate({ query: listTiresQuerySchema }), tireController.list);
router.get('/statistics', validate({ query: tireStatisticsQuerySchema }), tireController.getStatistics);
router.get('/alerts', tireController.getAlerts);
router.get('/:id', validate({ params: tireIdParamSchema }), tireController.getById);
router.put(
  '/:id',
  authorize('ADMINISTRADOR'),
  validate({ params: tireIdParamSchema, body: updateTireBodySchema }),
  tireController.update,
);
router.post(
  '/:id/event',
  authorize('ADMINISTRADOR', 'MOTORISTA'),
  validate({ params: tireIdParamSchema, body: registerTireEventBodySchema }),
  tireController.registerEvent,
);
router.delete('/:id', authorize('ADMINISTRADOR'), validate({ params: tireIdParamSchema }), tireController.delete);

export default router;
