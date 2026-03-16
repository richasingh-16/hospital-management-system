import prisma from "../../config/prisma";

export const createDoctor = async (data: any) => {
  return prisma.doctor.create({
    data: {
      specialization: data.specialization,
      experience: data.experience,
      phone: data.phone,

      user: {
        connect: { id: data.userId }
      },

      department: {
        connect: { id: data.departmentId }
      }
    }
  });
};

export const getDoctors = async () => {
  return prisma.doctor.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};