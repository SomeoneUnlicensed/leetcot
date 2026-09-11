-- Per-environment flag hash: each participant's container instance now gets its
-- own randomly generated flag (instead of everyone sharing one task-wide flag),
-- so flags can't be copy-pasted between participants during the event.
ALTER TABLE "TaskEnvironment" ADD COLUMN "flagHash" TEXT;
