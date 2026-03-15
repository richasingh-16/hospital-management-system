import prisma from "../../config/prisma";

export const createDoctor = async (data: any) => {
  return prisma.doctor.create({
    data
  });
};

export const getDoctors = async () => {
  return prisma.doctor.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};