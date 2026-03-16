import { Router } from "express";
import * as doctorController from "./doctor.controller";

const router = Router();

router.post("/", doctorController.createDoctor);
router.get("/", doctorController.getDoctors);

export default router;
