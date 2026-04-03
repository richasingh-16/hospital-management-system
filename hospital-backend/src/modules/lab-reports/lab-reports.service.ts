import prisma from "../../config/prisma";
import path from "path";

// ---------------------------------------------------------------------------
// Get all lab reports — newest first
// ---------------------------------------------------------------------------
export const getLabReports = async (patientId?: string) => {
  const reports = await prisma.labReport.findMany({
    where:   patientId ? { patientId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { patient: { select: { name: true } } },
  });
  return reports.map(shapeReport);
};

// ---------------------------------------------------------------------------
// Create a new lab test order
// ---------------------------------------------------------------------------
export const createLabReport = async (data: {
  patientId?: string;
  patientName: string;
  testType: string;
  orderedBy: string;
}) => {
  const report = await prisma.labReport.create({
    data: {
      patientId:   data.patientId || null,
      patientName: data.patientName,
      testType:    data.testType,
      orderedBy:   data.orderedBy,
      status:      "PENDING",
    },
    include: { patient: { select: { name: true } } },
  });
  return shapeReport(report);
};

// ---------------------------------------------------------------------------
// Move Pending → Processing
// ---------------------------------------------------------------------------
export const markProcessing = async (id: string) => {
  const report = await prisma.labReport.update({
    where: { id },
    data:  { status: "PROCESSING" },
    include: { patient: { select: { name: true } } },
  });
  return shapeReport(report);
};

// ---------------------------------------------------------------------------
// Upload result file → mark as Ready
// ---------------------------------------------------------------------------
export const markReady = async (id: string, file: Express.Multer.File) => {
  const report = await prisma.labReport.update({
    where: { id },
    data: {
      status:          "READY",
      resultFilePath:  file.path,
      resultFileName:  file.originalname,
    },
    include: { patient: { select: { name: true } } },
  });
  return shapeReport(report);
};

// ---------------------------------------------------------------------------
// Get the file path for download
// ---------------------------------------------------------------------------
export const getResultFilePath = async (id: string): Promise<string | null> => {
  const report = await prisma.labReport.findUnique({ where: { id } });
  return report?.resultFilePath ?? null;
};

// ---------------------------------------------------------------------------
// Helper: flatten Prisma object → UI-ready shape
// ---------------------------------------------------------------------------
function shapeReport(r: any) {
  const statusMap: Record<string, string> = {
    PENDING: "Pending", PROCESSING: "Processing", READY: "Ready",
  };
  return {
    id:               r.id,
    patientId:        r.patientId,
    patientName:      r.patientName,
    testType:         r.testType,
    orderedBy:        r.orderedBy,
    status:           statusMap[r.status] ?? r.status,
    resultFileName:   r.resultFileName ?? null,
    hasResult:        !!r.resultFilePath,
    orderedOn:        r.createdAt.toISOString().split("T")[0],
  };
}
