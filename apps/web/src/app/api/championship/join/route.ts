import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { prisma } from '@repo/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await request.json();
  const { championshipId } = body as { championshipId?: string };

  if (!championshipId) {
    return NextResponse.json({ error: 'championshipId обязателен' }, { status: 400 });
  }

  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
  });

  if (!championship) {
    return NextResponse.json({ error: 'Чемпионат не найден' }, { status: 404 });
  }

  if (championship.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Чемпионат не активен' }, { status: 400 });
  }

  const existing = await prisma.championshipParticipant.findFirst({
    where: { championshipId, userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ error: 'Вы уже участвуете в этом чемпионате' }, { status: 400 });
  }

  const participant = await prisma.championshipParticipant.create({
    data: {
      championshipId,
      userId: session.user.id,
      score: 0,
    },
  });

  return NextResponse.json({ participant });
}
