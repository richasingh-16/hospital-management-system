import { Request, Response } from "express";
import * as appointmentService from "./appointments.service";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await appointmentService.getAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const idParam = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({ error: "Appointment id is required" });
    }
    const { status } = req.body;

    const appointment = await appointmentService.updateAppointmentStatus(id, status);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error });
  }
};