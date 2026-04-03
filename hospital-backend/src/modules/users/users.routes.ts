import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import * as usersController from "./users.controller";

const router = Router();

router.get("/",                  authenticateToken, usersController.getUsers);
router.post("/",                 authenticateToken, usersController.createUser);
router.delete("/:id",            authenticateToken, usersController.deleteUser);
router.patch("/change-password", authenticateToken, usersController.changePassword);

export default router;
