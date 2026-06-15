import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Validation schema
const CreateSessionSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  studentName: z.string().min(1, 'Student name is required').max(255),
  studentSurname: z.string().max(255).optional(),
  studentClass: z.string().min(1, 'Student class is required').max(255),
});

// POST - Create a new exam session
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request
    const validatedData = CreateSessionSchema.parse(body);
    const { examId, studentName, studentSurname, studentClass } = validatedData;

    // Verify the exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Тест не найден.' }, { status: 404 });
    }

    if (exam.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Этот тест недоступен.' }, { status: 403 });
    }

    // Check timing
    const now = new Date();
    if (exam.startDate && exam.startDate > now) {
      return NextResponse.json({ error: 'Тест еще не начался.' }, { status: 403 });
    }

    if (exam.endDate && exam.endDate < now) {
      return NextResponse.json({ error: 'Тест завершен.' }, { status: 403 });
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
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Мяу! Некорректные данные в запросе.', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Create exam session error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при создании сессии экзамена.' },
      { status: 500 },
    );
  }
}
