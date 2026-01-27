-- AlterEnum
ALTER TYPE "WorkType" ADD VALUE 'AVIZ';

-- AlterTable
ALTER TABLE "work_reports" ADD COLUMN     "transportVehicle" TEXT;
