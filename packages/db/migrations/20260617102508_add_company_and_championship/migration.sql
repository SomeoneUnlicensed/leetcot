-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "companyRole" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Championship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipParticipant" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChampionshipParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipChallenge" (
    "championshipId" TEXT NOT NULL,
    "challengeId" INTEGER NOT NULL,

    CONSTRAINT "ChampionshipChallenge_pkey" PRIMARY KEY ("championshipId","challengeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Championship_slug_key" ON "Championship"("slug");

-- CreateIndex
CREATE INDEX "Championship_companyId_idx" ON "Championship"("companyId");

-- CreateIndex
CREATE INDEX "ChampionshipParticipant_championshipId_idx" ON "ChampionshipParticipant"("championshipId");

-- CreateIndex
CREATE INDEX "ChampionshipParticipant_userId_idx" ON "ChampionshipParticipant"("userId");

-- CreateIndex
CREATE INDEX "ChampionshipChallenge_championshipId_idx" ON "ChampionshipChallenge"("championshipId");

-- CreateIndex
CREATE INDEX "ChampionshipChallenge_challengeId_idx" ON "ChampionshipChallenge"("challengeId");
