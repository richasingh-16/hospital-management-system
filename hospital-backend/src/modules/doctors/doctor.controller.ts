import { Request, Response } from "express";
import * as doctorService from "./doctor.service";

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to create doctor" });
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
