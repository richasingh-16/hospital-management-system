import { Router } from "express";
import * as appointmentController from "./appointments.controller";

const router = Router();

router.post("/", appointmentController.createAppointment);
router.get("/", appointmentController.getAppointments);
router.patch("/:id/status", appointmentController.updateAppointmentStatus);

export default router;