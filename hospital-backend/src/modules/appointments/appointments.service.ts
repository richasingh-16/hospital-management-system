import prisma from "../../config/prisma";

export const createAppointment = async (data: any) => {
  return prisma.appointment.create({
    data
  });
};

export const getAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const updateAppointmentStatus = async (id: string, status: any) => {
  return prisma.appointment.update({
    where: { id },
    data: { status }
  });
};