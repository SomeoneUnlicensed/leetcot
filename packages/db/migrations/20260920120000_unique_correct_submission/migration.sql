-- A participant can solve a task only once. The submit route relies on this to make
-- concurrent correct submissions idempotent (no double scoring): the second insert loses
-- with a unique violation. Prisma cannot express partial unique indexes in schema.prisma,
-- so the index lives only in this migration. If duplicates already exist this fails loudly
-- (and the deploy aborts on the new instance) instead of silently dropping data.
CREATE UNIQUE INDEX "DebugSubmission_one_correct_per_task_user"
ON "DebugSubmission" ("taskId", "userId")
WHERE "isCorrect" = true;
