import { Request, Response } from "express";
import * as usersService from "./users.service";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user?.name ?? "Admin";
    const user = await usersService.createUser(req.body, actor);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user?.name ?? "Admin";
    const result = await usersService.deleteUser(req.params.id as string, actor);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both currentPassword and newPassword are required" });
    }
    const result = await usersService.changePassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
