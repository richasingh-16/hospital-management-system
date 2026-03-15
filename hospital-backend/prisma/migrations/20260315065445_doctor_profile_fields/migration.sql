/*
  Warnings:

  - Added the required column `phone` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('AVAILABLE', 'BUSY', 'IN_SURGERY', 'ON_LEAVE');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "patientsToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "status" "DoctorStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
