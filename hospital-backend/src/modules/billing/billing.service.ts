import prisma from "../../config/prisma";

// ---------------------------------------------------------------------------
// Get all invoices — newest first, with patient name included
// ---------------------------------------------------------------------------
export const getInvoices = async (patientId?: string) => {
  const invoices = await prisma.invoice.findMany({
    where:   patientId ? { patientId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { patient: { select: { name: true } } },
  });
  return invoices.map(shapeInvoice);
};

// ---------------------------------------------------------------------------
// Create a new invoice
// ---------------------------------------------------------------------------
export const createInvoice = async (data: {
  patientId: string;
  doctorName: string;
  doctorFee: number;
  labTests: number;
  medication: number;
  roomCharges: number;
}) => {
  const invoice = await prisma.invoice.create({
    data: {
      patientId:   data.patientId,
      doctorName:  data.doctorName,
      doctorFee:   data.doctorFee   || 0,
      labTests:    data.labTests    || 0,
      medication:  data.medication  || 0,
      roomCharges: data.roomCharges || 0,
      status:      "PENDING",
    },
    include: { patient: { select: { name: true } } },
  });
  return shapeInvoice(invoice);
};

// ---------------------------------------------------------------------------
// Mark an invoice as PAID
// ---------------------------------------------------------------------------
export const markInvoicePaid = async (id: string) => {
  const invoice = await prisma.invoice.update({
    where: { id },
    data:  { status: "PAID" },
    include: { patient: { select: { name: true } } },
  });
  return shapeInvoice(invoice);
};

// ---------------------------------------------------------------------------
// Mark an invoice as OVERDUE
// ---------------------------------------------------------------------------
export const markInvoiceOverdue = async (id: string) => {
  const invoice = await prisma.invoice.update({
    where: { id },
    data:  { status: "OVERDUE" },
    include: { patient: { select: { name: true } } },
  });
  return shapeInvoice(invoice);
};

// ---------------------------------------------------------------------------
// Helper: flatten nested object → UI-ready shape
// ---------------------------------------------------------------------------
function shapeInvoice(i: any) {
  const statusMap: Record<string, string> = {
    PAID: "Paid", PENDING: "Pending", OVERDUE: "Overdue",
  };
  return {
    id:          i.id,
    patientId:   i.patientId,
    patientName: i.patient?.name ?? "Unknown",
    doctor:      i.doctorName,
    doctorFee:   i.doctorFee,
    labTests:    i.labTests,
    medication:  i.medication,
    roomCharges: i.roomCharges,
    status:      statusMap[i.status] ?? i.status,
    date:        i.createdAt.toISOString().split("T")[0],
  };
}
