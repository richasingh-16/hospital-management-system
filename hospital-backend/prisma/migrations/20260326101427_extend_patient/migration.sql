-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "condition" TEXT,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "doctor" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'OPD',
ADD COLUMN     "ward" TEXT DEFAULT 'General';
