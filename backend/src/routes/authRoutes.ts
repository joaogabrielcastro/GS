import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

// Rotas protegidas
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.get(
  "/users",
  authenticate,
  (req, res, next) => authorize("ADMINISTRADOR")(req, res, next),
  authController.list,
);

router.post(
  "/users",
  authenticate,
  (req, res, next) => authorize("ADMINISTRADOR")(req, res, next),
  authController.createUser,
);

export default router;
