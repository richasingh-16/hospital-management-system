import { Request, Response } from "express";
import path from "path";
import * as labService from "./lab-reports.service";
import { logActivity } from "../../lib/activity-logger";

export const getLabReports = async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const reports = await labService.getLabReports(patientId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch lab reports" });
  }
};

export const createLabReport = async (req: Request, res: Response) => {
  try {
    const report = await labService.createLabReport(req.body);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("lab", `${report.testType} ordered for ${report.patientName}`, actor);
    res.json(report);
  } catch (error: any) {
    console.error("Lab report creation error:", error.message);
    res.status(500).json({ error: error.message || "Failed to create lab report" });
  }
};

export const markProcessing = async (req: Request, res: Response) => {
  try {
    const report = await labService.markProcessing(req.params.id as string);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("lab", `${report.testType} for ${report.patientName} marked as Processing`, actor);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update status" });
  }
};

export const markReady = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a PDF or DOC file." });
    }
    const report = await labService.markReady(req.params.id as string, req.file);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("lab", `${report.testType} result uploaded for ${report.patientName}`, actor);
    res.json(report);
  } catch (error: any) {
    console.error("Mark ready error:", error.message);
    res.status(500).json({ error: error.message || "Failed to upload result" });
  }
};

export const downloadResult = async (req: Request, res: Response) => {
  try {
    const filePath = await labService.getResultFilePath(req.params.id as string);
    if (!filePath) {
      return res.status(404).json({ error: "No result file found for this report" });
    }
    res.download(filePath);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to download file" });
  }
};
