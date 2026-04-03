import { Request, Response } from "express";
import * as appointmentService from "./appointments.service";
import { logActivity } from "../../lib/activity-logger";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("appointment", `Appointment booked for ${appointment.patientName} with ${appointment.doctor}`, actor);
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const appointments = await appointmentService.getAppointments(patientId);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const idParam = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) return res.status(400).json({ error: "Appointment id is required" });
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(id, status);
    const actor = (req as any).user?.name ?? "System";
    const label = status === "COMPLETED" ? "Completed" : status === "CANCELLED" ? "Cancelled" : status;
    await logActivity("appointment", `Appointment for ${appointment.patientName} marked as ${label}`, actor);
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};