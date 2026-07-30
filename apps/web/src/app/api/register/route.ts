import { prisma } from '@repo/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '~/lib/mailer';

const PENDING_REGISTRATION_PREFIX = 'register:';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function encodePendingRegistration(data: { email: string; name: string; passwordHash: string }) {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const normalizedEmail = String(email ?? '')
      .trim()
      .toLowerCase();
    const normalizedName = String(name ?? '').trim();

    if (!normalizedEmail || !password || !normalizedName) {
      return NextResponse.json({ error: 'Мяу! Нужно заполнить все поля.' }, { status: 400 });
    }

    if (String(password).length < 3) {
      return NextResponse.json({ error: 'Пароль слишком короткий.' }, { status: 400 });
    }

    await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: new Date() },
        identifier: { startsWith: PENDING_REGISTRATION_PREFIX },
      },
    });

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'Этот котик уже зарегистрирован!' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.verificationToken.deleteMany({
          where: {
            identifier: { startsWith: `${PENDING_REGISTRATION_PREFIX}${normalizedEmail}:` },
          },
        }),
        // Notification.toUserId/fromUserId are required (non-cascading) relations to
        // User, so an unverified account that already picked up a notification (e.g.
        // a mention before finishing signup) blocked this delete with Prisma P2014.
        prisma.notification.deleteMany({
          where: { OR: [{ toUserId: existingUser.id }, { fromUserId: existingUser.id }] },
        }),
        prisma.user.delete({ where: { id: existingUser.id } }),
      ]);
    } else {
      await prisma.verificationToken.deleteMany({
        where: { identifier: { startsWith: `${PENDING_REGISTRATION_PREFIX}${normalizedEmail}:` } },
      });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const identifier = `${PENDING_REGISTRATION_PREFIX}${normalizedEmail}:${encodePendingRegistration(
      {
        email: normalizedEmail,
        name: normalizedName,
        passwordHash: hashedPassword,
      },
    )}`;

    await prisma.verificationToken.create({
      data: { identifier, token: code, expires },
    });

    await sendVerificationEmail(normalizedEmail, code, normalizedName);

    return NextResponse.json({ message: 'Код отправлен на почту' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании котика.' },
      { status: 500 },
    );
  }
}
