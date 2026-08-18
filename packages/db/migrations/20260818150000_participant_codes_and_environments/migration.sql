-- AlterTable: participant login codes (admin-created accounts, no password)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_loginCode_key" ON "User"("loginCode");

-- AlterTable: task environments
ALTER TABLE "DebugTask" ADD COLUMN IF NOT EXISTS "dockerImage" TEXT;

-- DropTable: EventInvite is superseded by admin-issued participant codes
DROP TABLE IF EXISTS "EventInvite";

-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskEnvironmentStatus') THEN
        CREATE TYPE "TaskEnvironmentStatus" AS ENUM ('STARTING', 'RUNNING', 'STOPPED', 'FAILED');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "TaskEnvironment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "status" "TaskEnvironmentStatus" NOT NULL DEFAULT 'STARTING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TaskEnvironment_containerName_key" ON "TaskEnvironment"("containerName");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TaskEnvironment_taskId_userId_key" ON "TaskEnvironment"("taskId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskEnvironment_taskId_idx" ON "TaskEnvironment"("taskId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskEnvironment_userId_idx" ON "TaskEnvironment"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TaskEnvironment_expiresAt_idx" ON "TaskEnvironment"("expiresAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TaskEnvironment_taskId_fkey'
    ) THEN
        ALTER TABLE "TaskEnvironment" ADD CONSTRAINT "TaskEnvironment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DebugTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'TaskEnvironment_userId_fkey'
    ) THEN
        ALTER TABLE "TaskEnvironment" ADD CONSTRAINT "TaskEnvironment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
