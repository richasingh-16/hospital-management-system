import { Request, Response } from "express";
import * as activityLogService from "./activity-log.service";

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const logs = await activityLogService.getActivityLogs(from, to);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch activity logs" });
  }
};
