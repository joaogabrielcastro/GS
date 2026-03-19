import { Router } from "express";
import { truckController } from "../controllers/truckController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  assignDriverBodySchema,
  createTruckBodySchema,
  listTrucksQuerySchema,
  selectTruckBodySchema,
  truckIdParamSchema,
  updateTruckBodySchema,
} from "../schemas/truckSchemas";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.post(
  "/",
  authorize("ADMINISTRADOR"),
  validate({ body: createTruckBodySchema }),
  truckController.create,
);
router.get("/", validate({ query: listTrucksQuerySchema }), truckController.list);
router.get("/:id", validate({ params: truckIdParamSchema }), truckController.getById);
router.put(
  "/:id",
  authorize("ADMINISTRADOR"),
  validate({ params: truckIdParamSchema, body: updateTruckBodySchema }),
  truckController.update,
);
router.get(
  "/available/list",
  authorize("MOTORISTA", "ADMINISTRADOR"),
  truckController.getAvailable,
);
router.post(
  "/select",
  authorize("MOTORISTA"),
  validate({ body: selectTruckBodySchema }),
  truckController.selectTruck,
);
router.post("/release", authorize("MOTORISTA"), truckController.releaseTruck);
router.post(
  "/:id/assign-driver",
  authorize("ADMINISTRADOR"),
  validate({ params: truckIdParamSchema, body: assignDriverBodySchema }),
  truckController.assignDriver,
);
router.delete(
  "/:id",
  authorize("ADMINISTRADOR"),
  validate({ params: truckIdParamSchema }),
  truckController.delete,
);
router.get("/:id/history", validate({ params: truckIdParamSchema }), truckController.getHistory);

export default router;
