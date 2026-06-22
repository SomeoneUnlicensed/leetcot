-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'MATCHING';
ALTER TYPE "QuestionType" ADD VALUE 'FILL_IN_BLANK';
ALTER TYPE "QuestionType" ADD VALUE 'ORDERING';

-- AlterTable
ALTER TABLE "ExamQuestion" ADD COLUMN     "blankAnswers" JSONB,
ADD COLUMN     "correctAnswerText" TEXT,
ADD COLUMN     "matchingPairs" JSONB,
ADD COLUMN     "orderingItems" JSONB;
