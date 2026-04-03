import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import * as ctrl from "./admission.controller";

const router = Router();

router.get("/",                authenticateToken, ctrl.getAdmissions);
router.post("/",               authenticateToken, ctrl.admitPatient);
router.patch("/:id/discharge", authenticateToken, ctrl.dischargePatient);
router.get("/ward-overview",   authenticateToken, ctrl.getWardOverview);

export default router;
