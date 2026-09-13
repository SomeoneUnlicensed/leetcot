-- Self-registration for event participants: which block is currently open for
-- registration, and whether a participant's block has since been archived
-- (hidden from the leaderboard, name freed up for the next block).
ALTER TABLE "Championship" ADD COLUMN "activeRegistrationBlock" "EventBlock";
ALTER TABLE "ChampionshipParticipant" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
