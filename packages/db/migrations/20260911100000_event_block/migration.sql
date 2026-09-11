-- CreateEnum
CREATE TYPE "EventBlock" AS ENUM ('BLOCK_1', 'BLOCK_2');

-- AlterTable
ALTER TABLE "ChampionshipParticipant" ADD COLUMN "eventBlock" "EventBlock";

-- CreateIndex
CREATE INDEX "ChampionshipParticipant_eventBlock_idx" ON "ChampionshipParticipant"("eventBlock");
