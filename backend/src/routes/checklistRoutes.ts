import { Router } from "express";
import { checklistController } from "../controllers/checklistController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  checklistIdParamSchema,
  createChecklistBodySchema,
  listChecklistsQuerySchema,
} from "../schemas/checklistSchemas";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  "/upload-photos",
  authorize("MOTORISTA"),
  upload.any(), // Aceita qualquer campo: cabinPhoto, axle_1_esq, axle_2_dir, etc.
  checklistController.uploadPhotos,
);

router.post(
  "/",
  authorize("MOTORISTA"),
  validate({ body: createChecklistBodySchema }),
  checklistController.create,
);
router.get("/", validate({ query: listChecklistsQuerySchema }), checklistController.list);
router.get("/:id", validate({ params: checklistIdParamSchema }), checklistController.getById);

export default router;
