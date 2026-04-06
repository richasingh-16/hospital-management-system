/*
  Warnings:

  - A unique constraint covering the columns `[patientNumber]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "patientNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");
