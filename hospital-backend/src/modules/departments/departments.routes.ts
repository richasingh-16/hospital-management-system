import { Router } from "express";
import * as controller from "./departments.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", controller.getDepartments);

router.post(
  "/",
  requireRole("ADMIN"),
  controller.createDepartment
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  controller.deleteDepartment
);

export default router;