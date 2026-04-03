import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.get("/admin", dashboardController.getAdminDashboard);

export default router;
