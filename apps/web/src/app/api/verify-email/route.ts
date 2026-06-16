import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Не хватает данных.' }, { status: 400 });
    }

    const token = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token: code } },
    });

    if (!token) {
      return NextResponse.json({ error: 'Неверный код. Проверь и попробуй снова.' }, { status: 400 });
    }

    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: email, token: code } },
      });
      return NextResponse.json({ error: 'Код устарел. Зарегистрируйся заново.' }, { status: 400 });
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Clean up token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });

    return NextResponse.json({ message: 'Email подтверждён!' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Что-то пошло не так.' }, { status: 500 });
  }
}
