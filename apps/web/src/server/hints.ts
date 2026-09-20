// Each hint a participant opens costs a fixed share of the task's points, taken when the task is
// solved. Three hints per task is the convention (see packages/db/seed/data/debug-tasks.ts).
export const HINT_PENALTY_PERCENT = 20;

/** Points awarded for a solved task after `hintsUsed` hints were opened (never below 1). */
export function pointsAfterHints(points: number, hintsUsed: number): number {
  const kept = 1 - (HINT_PENALTY_PERCENT / 100) * hintsUsed;
  return Math.max(1, Math.round(points * kept));
}
