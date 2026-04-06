import { Router } from "express";
import * as doctorController from "./doctor.controller";

const router = Router();

router.post("/", doctorController.createDoctor);
router.get("/", doctorController.getDoctors);
router.patch("/:id/status", doctorController.updateDoctorStatus);

export default router;
