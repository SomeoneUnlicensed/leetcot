import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(_request: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;

  const championship = await prisma.championship.findUnique({
    where: { slug: org },
    include: {
      participants: {
        select: {
          score: true,
          joinedAt: true,
          user: { select: { name: true } },
        },
        orderBy: { score: 'desc' },
        take: 20,
      },
      challenges: {
        select: { challengeId: true },
      },
    },
  });

  if (!championship) {
    return NextResponse.json({ error: 'Championship not found' }, { status: 404 });
  }

  return NextResponse.json({
    organization: org,
    name: championship.name,
    status: championship.status,
    participants: championship.participants.length,
    top_scores: championship.participants.map((p) => ({
      user: p.user.name,
      score: p.score,
    })),
    timestamp: new Date().toISOString(),
  });
}
