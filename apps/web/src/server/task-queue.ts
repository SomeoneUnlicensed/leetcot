import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';

/**
 * Tasks are worked in a fixed order (easiest first, by sortOrder) rather than freely
 * chosen from the catalog — a participant's "current" task is the first one in that
 * order they haven't solved yet. Everything before it must already be solved;
 * everything after it is locked until they get there.
 */
export async function getQueueState(userId: string) {
  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
    include: {
      debugTasks: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  const tasks = championship?.debugTasks ?? [];

  const solvedTaskIds = new Set(
    (
      await prisma.debugSubmission.findMany({
        where: { userId, taskId: { in: tasks.map((t) => t.id) }, isCorrect: true },
        select: { taskId: true },
      })
    ).map((s) => s.taskId),
  );

  const currentTask = tasks.find((t) => !solvedTaskIds.has(t.id)) ?? null;

  return { championship, tasks, solvedTaskIds, currentTask };
}

/**
 * Checked directly (not via the session cookie — see the schema comment on
 * ChampionshipParticipant.lockedAt for why) on every participant-facing page and API
 * route. True once the organizer has kicked this participant's block or archived it.
 */
export async function isParticipantLocked(userId: string): Promise<boolean> {
  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship) return false;

  const participant = await prisma.championshipParticipant.findUnique({
    where: { championshipId_userId: { championshipId: championship.id, userId } },
  });
  if (!participant) return false;

  return participant.archived || Boolean(participant.lockedAt);
}
