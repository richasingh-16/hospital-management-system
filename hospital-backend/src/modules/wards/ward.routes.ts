import { Router } from "express";
import * as wardController from "./ward.controller";

const router = Router();

router.post("/", wardController.createWard);
router.get("/", wardController.getWards);

export default router;
