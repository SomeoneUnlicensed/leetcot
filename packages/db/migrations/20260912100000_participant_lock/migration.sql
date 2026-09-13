-- Explicit per-participant lock, checked directly on every participant-facing
-- page/route rather than relying on JWT session invalidation (which turned out to be
-- unreliable here: Auth.js re-stamps the JWT's iat on nearly every request, so a
-- sessionsInvalidatedAt timestamp comparison only catches the very next request and
-- can be raced).
ALTER TABLE "ChampionshipParticipant" ADD COLUMN "lockedAt" TIMESTAMP(3);
