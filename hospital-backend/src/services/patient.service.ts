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

export const updatePatient = async (id: string, data: any) => {
  return prisma.patient.update({
    where: { id },
    data,
  })
}

export const deletePatient = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    // Delete all related records first to satisfy foreign key constraints
    await tx.appointment.deleteMany({ where: { patientId: id } });
    
    // For admissions, we should theoretically free up the bed, but to keep it simple,
    // we'll just delete the admission directly.
    await tx.admission.deleteMany({ where: { patientId: id } });
    
    await tx.invoice.deleteMany({ where: { patientId: id } });
    await tx.labReport.deleteMany({ where: { patientId: id } });

    // Finally, delete the patient
    return tx.patient.delete({
      where: { id }
    });
  });
}