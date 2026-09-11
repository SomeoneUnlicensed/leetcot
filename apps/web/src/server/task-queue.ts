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
