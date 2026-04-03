import { Request, Response } from "express"
import { getPatients, createPatient, getPatientById } from "../services/patient.service"
import { logActivity } from "../lib/activity-logger"

export const fetchPatients = async (req: Request, res: Response) => {
  const patients = await getPatients()
  res.json(patients)
}

export const fetchPatientById = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const patient = await getPatientById(id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
};

export const addPatient = async (req: Request, res: Response) => {
  try {
    const patient = await createPatient(req.body)
    const actor = (req as any).user?.name ?? "System";
    await logActivity("patient", `New patient ${patient.name} registered`, actor);
    res.json(patient)
  } catch (error: any) {
    console.error("Patient Creation Error:", error);
    res.status(500).json({ error: error.message || "Failed to create patient" })
  }
}