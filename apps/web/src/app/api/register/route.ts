import { prisma } from '@repo/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Мяу! Нужно заполнить все поля.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Этот котик уже зарегистрирован!' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roles: {
          connectOrCreate: [
            {
              where: { role: 'USER' },
              create: { role: 'USER' },
            },
          ],
        },
      },
    });

    return NextResponse.json({
      message: 'Добро пожаловать в ЛитКот!',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании котика.' },
      { status: 500 },
    );
  }
}
