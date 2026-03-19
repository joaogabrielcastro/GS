import { Router } from 'express';
import { occurrenceController } from '../controllers/occurrenceController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate } from "../middleware/validate";
import {
  createOccurrenceBodySchema,
  listOccurrencesQuerySchema,
  occurrenceIdParamSchema,
  occurrenceStatisticsQuerySchema,
  updateOccurrenceStatusBodySchema,
} from "../schemas/occurrenceSchemas";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  '/upload-photos',
  authorize('MOTORISTA'),
  upload.array('photos', 5),
  occurrenceController.uploadPhotos
);

router.post('/', authorize('MOTORISTA'), validate({ body: createOccurrenceBodySchema }), occurrenceController.create);
router.get('/', validate({ query: listOccurrencesQuerySchema }), occurrenceController.list);
router.get('/statistics', validate({ query: occurrenceStatisticsQuerySchema }), occurrenceController.getStatistics);
router.get('/:id', validate({ params: occurrenceIdParamSchema }), occurrenceController.getById);
router.put(
  '/:id/status',
  authorize('ADMINISTRADOR', 'FINANCEIRO'),
  validate({ params: occurrenceIdParamSchema, body: updateOccurrenceStatusBodySchema }),
  occurrenceController.updateStatus
);

export default router;
