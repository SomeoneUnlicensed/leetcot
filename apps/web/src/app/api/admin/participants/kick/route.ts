import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { stopEnvironment } from '~/server/environments';
import { isAdmin } from '~/utils/auth-guards';

const KickSchema = z.object({
  block: z.enum(['BLOCK_1', 'BLOCK_2']).nullable().optional(),
});

/** Locks out currently active participants (optionally scoped to one block): every
 * participant-facing page/route checks ChampionshipParticipant.lockedAt directly on
 * each request (see isParticipantLocked), so this takes effect immediately and isn't
 * dependent on the session cookie ever being re-validated. Also bumps
 * User.sessionsInvalidatedAt as defense-in-depth for anything role-gated. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const parsed = KickSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Некорректные данные.' }, { status: 400 });
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship) {
    return NextResponse.json({ kicked: 0 });
  }

  const participants = await prisma.championshipParticipant.findMany({
    where: {
      championshipId: championship.id,
      archived: false,
      ...(parsed.data.block ? { eventBlock: parsed.data.block } : {}),
    },
    select: { id: true, userId: true },
  });

  const now = new Date();
  await prisma.championshipParticipant.updateMany({
    where: { id: { in: participants.map((p) => p.id) } },
    data: { lockedAt: now },
  });
  await prisma.user.updateMany({
    where: { id: { in: participants.map((p) => p.userId) } },
    data: { sessionsInvalidatedAt: now },
  });

  // Locking a participant out of the page doesn't touch their Docker container —
  // without this they'd sit running (using up the host's CPU/RAM budget) until the
  // idle reaper eventually catches them, up to ENVIRONMENT_IDLE_MINUTES later.
  const runningEnvs = await prisma.taskEnvironment.findMany({
    where: { userId: { in: participants.map((p) => p.userId) }, status: 'RUNNING' },
  });
  await Promise.all(
    runningEnvs.map((env) =>
      stopEnvironment(env).catch((error) => {
        console.error(`Failed to stop environment ${env.containerName} on kick:`, error);
      }),
    ),
  );

  return NextResponse.json({ kicked: participants.length, environmentsStopped: runningEnvs.length });
}
