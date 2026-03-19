import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { fileController } from "../controllers/fileController";

const router = Router();

router.use(authenticate);
router.get("/:category/:filename", fileController.getPrivateFile);

export default router;
