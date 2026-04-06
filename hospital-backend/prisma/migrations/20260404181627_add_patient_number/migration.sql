/*
  Warnings:

  - You are about to drop the column `patientCode` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "patientCode",
ADD COLUMN     "patientNumber" SERIAL NOT NULL;
