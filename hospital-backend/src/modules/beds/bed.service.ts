import prisma from "../../config/prisma";

export const createBed = async (data: any) => {
  return prisma.bed.create({
    data
  });
};

export const getBeds = async () => {
  return prisma.bed.findMany({
    include: {
      ward: true
    }
  });
};
