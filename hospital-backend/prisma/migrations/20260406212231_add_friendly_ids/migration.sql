-- AlterTable
ALTER TABLE "Admission" ADD COLUMN     "admissionNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "LabReport" ADD COLUMN     "reportNumber" SERIAL NOT NULL;
