/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `Appointment` table. All the data in the column will be lost.
  - The `status` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `dateTime` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "scheduledAt",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED';
