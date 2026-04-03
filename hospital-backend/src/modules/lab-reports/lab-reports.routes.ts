import { Router } from "express";
import * as labController from "./lab-reports.controller";
import { upload } from "./multer.config";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

// List all lab reports
router.get("/", authenticateToken, labController.getLabReports);

// Order a new lab test
router.post("/", authenticateToken, labController.createLabReport);

// Move Pending → Processing
router.patch("/:id/processing", authenticateToken, labController.markProcessing);

// Upload result file → mark as Ready
// multer parses the multipart/form-data and puts file on req.file
router.patch("/:id/ready", authenticateToken, upload.single("resultFile"), labController.markReady);

// Download the result file
router.get("/:id/download", authenticateToken, labController.downloadResult);

export default router;
