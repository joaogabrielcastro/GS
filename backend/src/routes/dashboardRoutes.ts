import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Apenas administradores e financeiro podem ver o dashboard completo?
// Ou motoristas tem um dashboard proprio?
// O endpoint getAdminStats sugere que é para admin.
router.get(
  "/admin-stats",
  authorize("ADMINISTRADOR", "FINANCEIRO"),
  dashboardController.getAdminStats,
);
router.get(
  "/driver-stats",
  authorize("MOTORISTA"),
  dashboardController.getDriverStats,
);
router.get(
  "/financial-stats",
  authorize("ADMINISTRADOR", "FINANCEIRO"),
  dashboardController.getFinancialStats,
);

export default router;
