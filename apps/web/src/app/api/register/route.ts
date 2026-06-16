import { prisma } from '@repo/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '~/lib/mailer';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Мяу! Нужно заполнить все поля.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // If user exists but not verified, allow resend
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'Этот котик уже зарегистрирован!' }, { status: 400 });
      }
      // Delete old verification tokens for this email
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          emailVerified: null,
          roles: {
            connectOrCreate: [{ where: { role: 'USER' }, create: { role: 'USER' } }],
          },
        },
      });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires },
    });

    await sendVerificationEmail(email, code, name);

    return NextResponse.json({ message: 'Код отправлен на почту' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании котика.' },
      { status: 500 },
    );
  }
}
