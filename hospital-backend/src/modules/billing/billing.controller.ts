import { Request, Response } from "express";
import * as billingService from "./billing.service";
import { logActivity } from "../../lib/activity-logger";

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const patientId = req.query.patientId as string | undefined;
    const invoices = await billingService.getInvoices(patientId);
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch invoices" });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await billingService.createInvoice(req.body);
    const actor = (req as any).user?.name ?? "System";
    const total = invoice.doctorFee + invoice.labTests + invoice.medication + invoice.roomCharges;
    await logActivity("billing", `Invoice generated for ${invoice.patientName} — ₹${total.toLocaleString("en-IN")}`, actor);
    res.json(invoice);
  } catch (error: any) {
    console.error("Invoice creation error:", error.message);
    res.status(500).json({ error: error.message || "Failed to create invoice" });
  }
};

export const markPaid = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const invoice = await billingService.markInvoicePaid(id);
    const actor = (req as any).user?.name ?? "System";
    await logActivity("billing", `Invoice marked as Paid for ${invoice.patientName}`, actor);
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to mark invoice as paid" });
  }
};

export const markOverdue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const invoice = await billingService.markInvoiceOverdue(id);
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to mark invoice as overdue" });
  }
};
