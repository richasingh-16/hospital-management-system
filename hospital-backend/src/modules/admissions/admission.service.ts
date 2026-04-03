import prisma from "../../config/prisma";
import { logActivity } from "../../lib/activity-logger";

// ---------------------------------------------------------------------------
// Shape a DB admission for the frontend
// ---------------------------------------------------------------------------
function shapeAdmission(adm: any) {
  return {
    id:          adm.id,
    patientId:   adm.patientId,
    patientName: adm.patient?.name ?? "Unknown",
    age:         adm.patient?.age ?? 0,
    gender:      adm.patient?.gender ?? "—",
    doctor:      adm.doctor?.user?.name ?? "—",
    ward:        adm.bed?.ward?.name ?? "—",
    bed:         String(adm.bed?.number ?? "—"),
    admittedOn:  adm.createdAt.toISOString().split("T")[0],
    condition:   adm.reason,
    status:      "Active" as const,  // all records in DB are active; deleted on discharge
  };
}

// ---------------------------------------------------------------------------
// Get all admissions (active first)
// ---------------------------------------------------------------------------
export const getAdmissions = async () => {
  const admissions = await prisma.admission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      doctor:  { include: { user: { select: { name: true } } } },
      bed:     { include: { ward: true } },
    },
  });
  return admissions.map(shapeAdmission);
};

// ---------------------------------------------------------------------------
// Admit a patient — simple ward-name-based: find first available bed in ward
// ---------------------------------------------------------------------------
export const admitPatient = async (
  data: { patientName: string; condition: string; doctorName: string; wardName: string; bedNumber?: string },
  actor: string
) => {
  // Find or create ward
  let ward = await prisma.ward.findFirst({ where: { name: data.wardName } });
  if (!ward) {
    ward = await prisma.ward.create({ data: { name: data.wardName, floor: 1, capacity: 20 } });
  }

  // Find an available bed (or create one for this ward)
  let bed = await prisma.bed.findFirst({
    where: { wardId: ward.id, status: "AVAILABLE" },
    orderBy: { number: "asc" },
  });
  if (!bed) {
    const lastBed = await prisma.bed.findFirst({ where: { wardId: ward.id }, orderBy: { number: "desc" } });
    bed = await prisma.bed.create({ data: { wardId: ward.id, number: (lastBed?.number ?? 0) + 1, status: "AVAILABLE" } });
  }

  // Find or create patient record (walk-in admission)
  let patient = await prisma.patient.findFirst({ where: { name: data.patientName } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { name: data.patientName, age: 0, gender: "—", status: "Admitted", ward: data.wardName },
    });
  }

  // Find doctor by name (via user)
  const doctorUser = await prisma.user.findFirst({ where: { name: data.doctorName } });
  const doctor = doctorUser ? await prisma.doctor.findUnique({ where: { userId: doctorUser.id } }) : null;
  if (!doctor) throw new Error(`Doctor "${data.doctorName}" not found. Make sure they are registered.`);

  // Create admission + mark bed occupied
  const admission = await prisma.admission.create({
    data: { patientId: patient.id, doctorId: doctor.id, bedId: bed.id, reason: data.condition },
    include: {
      patient: true,
      doctor:  { include: { user: { select: { name: true } } } },
      bed:     { include: { ward: true } },
    },
  });

  await prisma.bed.update({ where: { id: bed.id }, data: { status: "OCCUPIED" } });
  await logActivity("admission", `${data.patientName} admitted to ${data.wardName} Ward`, actor);

  return shapeAdmission(admission);
};

// ---------------------------------------------------------------------------
// Discharge — mark bed available again
// ---------------------------------------------------------------------------
export const dischargePatient = async (admissionId: string, actor: string) => {
  const adm = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: { patient: true, bed: true },
  });
  if (!adm) throw new Error("Admission not found");

  await prisma.bed.update({ where: { id: adm.bedId }, data: { status: "AVAILABLE" } });
  await logActivity("discharge", `${adm.patient.name} discharged`, actor);

  return { id: adm.id };
};

// ---------------------------------------------------------------------------
// Ward overview — bed stats per ward
// ---------------------------------------------------------------------------
export const getWardOverview = async () => {
  const wards = await prisma.ward.findMany({
    include: { beds: true },
    orderBy:  { name: "asc" },
  });

  return wards.map((w) => ({
    id:       w.id,
    name:     w.name,
    total:    w.beds.length || w.capacity,
    occupied: w.beds.filter((b) => b.status === "OCCUPIED").length,
  }));
};
