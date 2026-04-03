import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};
