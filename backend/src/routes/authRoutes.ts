import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  loginBodySchema,
  registerBodySchema,
  updateProfileBodySchema,
} from "../schemas/authSchemas";

const router = Router();

// Rotas públicas
router.post("/register", validate({ body: registerBodySchema }), authController.register);
router.post("/login", validate({ body: loginBodySchema }), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// Rotas protegidas
router.get("/profile", authenticate, authController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate({ body: updateProfileBodySchema }),
  authController.updateProfile,
);
router.get(
  "/users",
  authenticate,
  validate({ query: listUsersQuerySchema }),
  (req, res, next) => authorize("ADMINISTRADOR")(req, res, next),
  authController.list,
);

router.post(
  "/users",
  authenticate,
  validate({ body: createUserBodySchema }),
  (req, res, next) => authorize("ADMINISTRADOR")(req, res, next),
  authController.createUser,
);

export default router;
