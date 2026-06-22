-- AlterTable
ALTER TABLE "ExamQuestion" ADD COLUMN     "functionName" TEXT,
ADD COLUMN     "functionParams" JSONB;
