import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import * as settingsController from "./settings.controller";

const router = Router();

router.get("/",  authenticateToken, settingsController.getSettings);
router.patch("/", authenticateToken, settingsController.updateSettings);

export default router;
