import prisma from "../../config/prisma";

export const createAppointment = async (data: {
  patientId: string;
  doctorId: string;
  dateTime: string;   // ISO string e.g. "2026-04-01T09:00:00.000Z"
  type: string;
  notes?: string;
}) => {
  const appointment = await prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      dateTime: new Date(data.dateTime),
      status: "SCHEDULED",
      notes: data.notes || "",
    },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } }
    }
  });

  return shapeAppointment(appointment);
};

export const getAppointments = async (patientId?: string) => {
  const appointments = await prisma.appointment.findMany({
    where: patientId ? { patientId } : undefined,
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return appointments.map(shapeAppointment);
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: status as any },
    include: {
      patient: true,
      doctor: { include: { user: true, department: true } }
    }
  });
  return shapeAppointment(updated);
};

// ---------------------------------------------------------------------------
// Helper: flatten the nested Prisma object into what the UI needs
// ---------------------------------------------------------------------------
function shapeAppointment(a: any) {
  const dt = new Date(a.dateTime);
  const statusMap: Record<string, string> = {
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return {
    id: a.id,
    patientId: a.patientId,
    doctorId: a.doctorId,
    patientName: a.patient?.name ?? "Unknown",
    doctor: a.doctor?.user?.name ?? "Unknown",
    department: a.doctor?.department?.name ?? "—",
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    type: a.notes || "OPD",        // we repurpose notes for type (see create)
    status: statusMap[a.status] ?? a.status,
  };
}