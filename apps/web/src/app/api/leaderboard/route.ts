import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { NextResponse } from 'next/server';

const VALID_BLOCKS = new Set(['BLOCK_1', 'BLOCK_2']);

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const blockParam = searchParams.get('block');
  const eventBlock = blockParam && VALID_BLOCKS.has(blockParam) ? blockParam : null;

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship) {
    return NextResponse.json({ participants: [] });
  }

  const participants = await prisma.championshipParticipant.findMany({
    where: {
      championshipId: championship.id,
      ...(eventBlock ? { eventBlock: eventBlock as 'BLOCK_1' | 'BLOCK_2' } : {}),
    },
    orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
    include: { user: { select: { name: true, image: true } } },
    take: 100,
  });

  return NextResponse.json({
    participants: participants.map((p) => ({
      id: p.id,
      name: p.user.name,
      image: p.user.image,
      score: p.score,
    })),
  });
}
