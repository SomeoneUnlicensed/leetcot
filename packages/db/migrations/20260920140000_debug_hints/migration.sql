-- Progressive hints for debug tasks: the ordered hint texts live on the task, and every hint a
-- participant opens is recorded (it costs points, see apps/web/src/server/hints.ts).
ALTER TABLE "DebugTask" ADD COLUMN "hints" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "DebugHintReveal" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugHintReveal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DebugHintReveal_taskId_userId_level_key" ON "DebugHintReveal"("taskId", "userId", "level");
CREATE INDEX "DebugHintReveal_userId_idx" ON "DebugHintReveal"("userId");

ALTER TABLE "DebugHintReveal" ADD CONSTRAINT "DebugHintReveal_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DebugTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DebugHintReveal" ADD CONSTRAINT "DebugHintReveal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
