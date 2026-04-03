import prisma from "../../config/prisma";

export const createWard = async (data: any) => {
  return prisma.ward.create({
    data
  });
};

export const getWards = async () => {
  return prisma.ward.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};
