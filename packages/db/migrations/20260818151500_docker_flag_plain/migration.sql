-- AlterTable: plaintext flag for docker-backed tasks, needed to inject into the
-- container at start (hash-only stays the rule for every other task).
ALTER TABLE "DebugTask" ADD COLUMN IF NOT EXISTS "dockerFlagPlain" TEXT;
