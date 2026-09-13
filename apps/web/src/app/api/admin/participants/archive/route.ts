import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { isAdmin } from '~/utils/auth-guards';

const ArchiveSchema = z.object({
  block: z.enum(['BLOCK_1', 'BLOCK_2']),
});

/** Archives every participant in the given block: hidden from the leaderboard, can no
 * longer log in, and their name is freed up for the next block's self-registration.
 * Does not delete anything — archived rows stay fully queryable for the record. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const parsed = ArchiveSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Некорректные данные.' }, { status: 400 });
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship) {
    return NextResponse.json({ archived: 0 });
  }

  const result = await prisma.championshipParticipant.updateMany({
    where: { championshipId: championship.id, eventBlock: parsed.data.block, archived: false },
    data: { archived: true },
  });

  // If registration was still pointed at the block being archived, close it too —
  // otherwise a stray participant could keep self-registering into an archived block.
  if (championship.activeRegistrationBlock === parsed.data.block) {
    await prisma.championship.update({
      where: { id: championship.id },
      data: { activeRegistrationBlock: null },
    });
  }

  return NextResponse.json({ archived: result.count });
}
