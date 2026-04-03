import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { getActivityLogs } from "./activity-log.controller";

const router = Router();

// GET /api/activity-log?from=2026-03-27&to=2026-04-03
router.get("/", authenticateToken, getActivityLogs);

export default router;
