import { Request, Response } from "express";
import * as admissionService from "./admission.service";

export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const admissions = await admissionService.getAdmissions();
    res.json(admissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const admitPatient = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user?.name ?? "System";
    const admission = await admissionService.admitPatient(req.body, actor);
    res.json(admission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const dischargePatient = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user?.name ?? "System";
    const result = await admissionService.dischargePatient(req.params.id as string, actor);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getWardOverview = async (req: Request, res: Response) => {
  try {
    const wards = await admissionService.getWardOverview();
    res.json(wards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
