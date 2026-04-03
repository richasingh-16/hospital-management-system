import { Request, Response } from "express";
import * as wardService from "./ward.service";

export const createWard = async (req: Request, res: Response) => {
  try {
    const ward = await wardService.createWard(req.body);
    res.status(201).json(ward);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create ward", details: error.message });
  }
};

export const getWards = async (req: Request, res: Response) => {
  try {
    const wards = await wardService.getWards();
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wards" });
  }
};
