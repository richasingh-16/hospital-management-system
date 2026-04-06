/*
  Warnings:

  - You are about to drop the column `patientNumber` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "patientNumber";

-- CreateTable
CREATE TABLE "HospitalSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "HospitalSetting_pkey" PRIMARY KEY ("key")
);
