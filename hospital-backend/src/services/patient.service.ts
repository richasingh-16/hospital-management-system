import prisma from "../config/prisma"

export const getPatients = async () => {
  return prisma.patient.findMany({ orderBy: { createdAt: 'desc' } })
}

export const getPatientById = async (id: string) => {
  return prisma.patient.findUnique({ where: { id } })
}

export const createPatient = async (data: any) => {
  return prisma.patient.create({
    data
  })
}