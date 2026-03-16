import { Request, Response } from "express";
import * as departmentService from "./departments.services";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const department = await departmentService.createDepartment(name);

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: "Failed to create department" });
  }
};

export const getDepartments = async (_req: Request, res: Response) => {
  try {
    const departments = await departmentService.getDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const idParam = (req.params as any).id as string | string[] | undefined;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({ error: "Department id is required" });
    }

    await departmentService.deleteDepartment(id);

    res.json({ message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department" });
  }
};