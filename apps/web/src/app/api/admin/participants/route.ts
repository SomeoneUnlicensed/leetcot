import { LENTA_CHAMPIONSHIP_SLUG, generateLoginCode, prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { isAdmin } from '~/utils/auth-guards';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship) {
    return NextResponse.json({ participants: [] });
  }

  const participants = await prisma.championshipParticipant.findMany({
    where: { championshipId: championship.id },
    orderBy: { joinedAt: 'desc' },
    include: { user: { select: { name: true, loginCode: true, createdAt: true } } },
  });

  return NextResponse.json({
    participants: participants.map((p) => ({
      id: p.id,
      name: p.user.name,
      code: p.user.loginCode,
      score: p.score,
      createdAt: p.user.createdAt,
    })),
  });
}

const CreateParticipantsSchema = z.object({
  names: z.array(z.string().trim().min(1).max(80)).min(1).max(500),
});

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const parsed = CreateParticipantsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Список имён пуст или некорректен.' }, { status: 400 });
  }

  const championship = await prisma.championship.upsert({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
    update: {},
    create: {
      slug: LENTA_CHAMPIONSHIP_SLUG,
      name: 'Лента: Дебаг-Симулятор',
      description: 'Дебаг-симулятор для мероприятия Ленты.',
      status: 'DRAFT',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  const created: { name: string; code: string }[] = [];

  for (const name of parsed.data.names) {
    let code = generateLoginCode();
    // Extremely unlikely to collide, but keep it correct rather than assume.
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await prisma.user.findUnique({ where: { loginCode: code } });
      if (!existing) break;
      code = generateLoginCode();
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: `participant-${code.toLowerCase()}@lentatech.local`,
        loginCode: code,
        emailVerified: new Date(),
        roles: {
          connectOrCreate: [{ where: { role: 'USER' }, create: { role: 'USER' } }],
        },
      },
    });

    await prisma.championshipParticipant.create({
      data: { championshipId: championship.id, userId: user.id, score: 0 },
    });

    created.push({ name, code });
  }

  return NextResponse.json({ created });
}
