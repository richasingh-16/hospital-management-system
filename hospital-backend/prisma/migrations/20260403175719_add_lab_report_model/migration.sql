-- CreateEnum
CREATE TYPE "LabStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY');

-- CreateTable
CREATE TABLE "LabReport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "orderedBy" TEXT NOT NULL,
    "status" "LabStatus" NOT NULL DEFAULT 'PENDING',
    "resultFilePath" TEXT,
    "resultFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LabReport" ADD CONSTRAINT "LabReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
