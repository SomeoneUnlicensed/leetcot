import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST - Create a new exam session
export async function POST(req: Request) {
  try {
    const {
      examId,
      studentName,
      studentSurname,
      studentClass,
    } = await req.json();

    if (!examId || !studentName || !studentClass) {
      return NextResponse.json(
        { error: 'Мяу! Укажите тест, имя и класс.' },
        { status: 400 }
      );
    }

    // Verify the exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Тест не найден.' },
        { status: 404 }
      );
    }

    if (exam.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Этот тест недоступен.' },
        { status: 403 }
      );
    }

    // Check timing
    const now = new Date();
    if (exam.startDate && exam.startDate > now) {
      return NextResponse.json(
        { error: 'Тест еще не начался.' },
        { status: 403 }
      );
    }

    if (exam.endDate && exam.endDate < now) {
      return NextResponse.json(
        { error: 'Тест завершен.' },
        { status: 403 }
      );
    }

    // Create the session
    const session = await prisma.examSession.create({
      data: {
        id: uuidv4(),
        examId,
        studentName,
        studentSurname: studentSurname || undefined,
        studentClass,
        status: 'NOT_STARTED',
        startedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Сессия экзамена успешно создана!',
        session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create exam session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании сессии экзамена.' },
      { status: 500 }
    );
  }
}
