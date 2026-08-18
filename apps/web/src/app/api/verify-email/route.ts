import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { NextResponse } from 'next/server';

const PENDING_REGISTRATION_PREFIX = 'register:';

function decodePendingRegistration(identifier: string) {
  const encoded = identifier.split(':').slice(2).join(':');
  if (!encoded) return null;

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      email: string;
      name: string;
      passwordHash: string;
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const normalizedEmail = String(email ?? '')
      .trim()
      .toLowerCase();
    const normalizedCode = String(code ?? '').trim();

    if (!normalizedEmail || !normalizedCode) {
      return NextResponse.json({ error: 'Не хватает данных.' }, { status: 400 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: { startsWith: `${PENDING_REGISTRATION_PREFIX}${normalizedEmail}:` },
        token: normalizedCode,
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Неверный код. Проверь и попробуй снова.' },
        { status: 400 },
      );
    }

    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: token.identifier, token: token.token } },
      });
      return NextResponse.json({ error: 'Код устарел. Зарегистрируйся заново.' }, { status: 400 });
    }

    const pendingRegistration = decodePendingRegistration(token.identifier);
    if (!pendingRegistration || pendingRegistration.email !== normalizedEmail) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: token.identifier, token: token.token } },
      });
      return NextResponse.json(
        { error: 'Код поврежден. Зарегистрируйся заново.' },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: pendingRegistration.name,
          password: pendingRegistration.passwordHash,
          emailVerified: new Date(),
          roles: {
            connectOrCreate: [{ where: { role: 'USER' }, create: { role: 'USER' } }],
          },
        },
        create: {
          email: normalizedEmail,
          name: pendingRegistration.name,
          password: pendingRegistration.passwordHash,
          emailVerified: new Date(),
          roles: {
            connectOrCreate: [{ where: { role: 'USER' }, create: { role: 'USER' } }],
          },
        },
      }),
      prisma.verificationToken.delete({
        where: { identifier_token: { identifier: token.identifier, token: token.token } },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: { startsWith: `${PENDING_REGISTRATION_PREFIX}${normalizedEmail}:` } },
      }),
      prisma.eventInvite.updateMany({
        where: {
          email: normalizedEmail,
          championship: { slug: LENTA_CHAMPIONSHIP_SLUG },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: 'Email подтверждён!' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
