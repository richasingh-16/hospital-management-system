import { Router } from "express";
import * as billingController from "./billing.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

router.get("/",              authenticateToken, billingController.getInvoices);
router.post("/",             authenticateToken, billingController.createInvoice);
router.patch("/:id/pay",     authenticateToken, billingController.markPaid);
router.patch("/:id/overdue", authenticateToken, billingController.markOverdue);

export default router;
