import { randomBytes } from 'node:crypto';
import { LENTA_CHAMPIONSHIP_SLUG, hashPassword, normalizeParticipantName, prisma } from '@repo/db';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '~/utils/rateLimit';

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  password: z.string().min(6).max(200),
});

export async function POST(req: Request): Promise<NextResponse> {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const isRateLimited = rateLimit(`participant-register:${ip}`, {
    windowSize: 60 * 1000,
    maxRequests: 10,
  });
  if (isRateLimited) {
    return NextResponse.json({ error: 'Слишком много попыток. Подождите немного.' }, { status: 429 });
  }

  const parsed = RegisterSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'ФИО и пароль (минимум 6 символов) обязательны.' },
      { status: 400 },
    );
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });
  if (!championship?.activeRegistrationBlock) {
    return NextResponse.json(
      { error: 'Регистрация сейчас закрыта. Дождитесь объявления организаторов.' },
      { status: 403 },
    );
  }

  const name = normalizeParticipantName(parsed.data.name);

  const existing = await prisma.user.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      championships: { some: { archived: false, championshipId: championship.id } },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Участник с таким ФИО уже зарегистрирован. Если это не вы, уточните ФИО.' },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const syntheticEmail = `player-${randomBytes(6).toString('hex')}@lentatech.local`;

  await prisma.user.create({
    data: {
      name,
      email: syntheticEmail,
      password: passwordHash,
      emailVerified: new Date(),
      roles: { connectOrCreate: [{ where: { role: 'USER' }, create: { role: 'USER' } }] },
      championships: {
        create: {
          championshipId: championship.id,
          score: 0,
          eventBlock: championship.activeRegistrationBlock,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
