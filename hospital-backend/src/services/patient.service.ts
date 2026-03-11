import prisma from "../config/prisma"

export const getPatients = async () => {
  return prisma.patient.findMany()
}

export const createPatient = async (data: {
  name: string
  age: number
  gender: string
}) => {
  return prisma.patient.create({
    data
  })
}