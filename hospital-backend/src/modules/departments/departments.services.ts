import prisma from "../../config/prisma";

export const createDepartment = async (name: string) => {
  return prisma.department.create({
    data: { name }
  });
};

export const getDepartments = async () => {
  return prisma.department.findMany({
    orderBy: {
      name: "asc"
    }
  });
};

export const getDepartmentById = async (id: string) => {
  return prisma.department.findUnique({
    where: { id }
  });
};

export const deleteDepartment = async (id: string) => {
  return prisma.department.delete({
    where: { id }
  });
};