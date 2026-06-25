-- AlterTable: add executionTimeMs to Submission
-- Nullable (INT?) so existing rows default to NULL
ALTER TABLE "Submission" ADD COLUMN "executionTimeMs" INTEGER;
