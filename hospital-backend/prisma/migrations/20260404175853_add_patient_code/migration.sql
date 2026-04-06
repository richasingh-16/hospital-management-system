/*
  Warnings:

  - You are about to drop the column `patientNumber` on the `Patient` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Patient_patientNumber_key";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "patientNumber",
ADD COLUMN     "patientCode" SERIAL NOT NULL;
