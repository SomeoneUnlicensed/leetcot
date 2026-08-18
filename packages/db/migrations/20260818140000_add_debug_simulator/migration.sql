-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DebugTaskCategory') THEN
        CREATE TYPE "DebugTaskCategory" AS ENUM ('RECON', 'ACCESS', 'NETWORK', 'WEB', 'CLOUD', 'CRYPTO', 'INCIDENT_RESPONSE');
    END IF;
END $$;

-- CreateIndex
-- Championship/participant scoring relies on one row per (championship, user); this
-- was never enforced before because the championship feature had no UI/API using it yet.
CREATE UNIQUE INDEX IF NOT EXISTS "ChampionshipParticipant_championshipId_userId_key" ON "ChampionshipParticipant"("championshipId", "userId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "DebugTask" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DebugTaskCategory" NOT NULL,
    "instructions" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "flagHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebugTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DebugSubmission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventInvite" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DebugTask_slug_key" ON "DebugTask"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DebugTask_championshipId_idx" ON "DebugTask"("championshipId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DebugSubmission_taskId_idx" ON "DebugSubmission"("taskId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DebugSubmission_userId_idx" ON "DebugSubmission"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DebugSubmission_taskId_userId_isCorrect_idx" ON "DebugSubmission"("taskId", "userId", "isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EventInvite_championshipId_email_key" ON "EventInvite"("championshipId", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventInvite_championshipId_idx" ON "EventInvite"("championshipId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DebugTask_championshipId_fkey'
    ) THEN
        ALTER TABLE "DebugTask" ADD CONSTRAINT "DebugTask_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DebugSubmission_taskId_fkey'
    ) THEN
        ALTER TABLE "DebugSubmission" ADD CONSTRAINT "DebugSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DebugTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DebugSubmission_userId_fkey'
    ) THEN
        ALTER TABLE "DebugSubmission" ADD CONSTRAINT "DebugSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'EventInvite_championshipId_fkey'
    ) THEN
        ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
