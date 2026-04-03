import { Router } from "express";
import * as bedController from "./bed.controller";

const router = Router();

router.post("/", bedController.createBed);
router.get("/", bedController.getBeds);

export default router;
