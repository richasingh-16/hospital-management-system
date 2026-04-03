import { Request, Response } from "express";
import * as bedService from "./bed.service";

export const createBed = async (req: Request, res: Response) => {
  try {
    const bed = await bedService.createBed(req.body);
    res.status(201).json(bed);
  } catch (error) {
    res.status(500).json({ error: "Failed to create bed" });
  }
};

export const getBeds = async (_req: Request, res: Response) => {
  try {
    const beds = await bedService.getBeds();
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch beds" });
  }
};
