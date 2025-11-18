-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'None';

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "status" DROP NOT NULL;
