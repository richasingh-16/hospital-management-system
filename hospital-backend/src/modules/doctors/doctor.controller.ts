import { Request, Response } from "express";
import * as doctorService from "./doctor.service";
import { logActivity } from "../../lib/activity-logger";

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("doctor", `${doctor.name} added to ${doctor.department}`, actor);
    res.json(doctor);
  } catch (error: any) {
    console.error("Doctor creation error:", error.message);
    res.status(500).json({ error: error.message || "Failed to create doctor" });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await doctorService.getDoctors();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

export const updateDoctorStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const result = await doctorService.updateDoctorStatus(id, status);
    const actor = (req as any).user?.name ?? 'System';
    await logActivity('doctor', `${result.name} status changed to ${status}`, actor);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update status' });
  }
};
