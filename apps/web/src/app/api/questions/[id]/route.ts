import { prisma } from '@repo/db';
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Мяу! Нужно авторизоваться.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Котик не найден.' },
        { status: 404 }
      );
    }

    const question = await prisma.examQuestion.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Вопрос не найден.' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this exam
    if (question.exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому вопросу.' },
        { status: 403 }
      );
    }

    const {
      type,
      content,
      order,
      points,
      language,
      options,
      correctAnswers,
    } = await req.json();

    const updatedQuestion = await prisma.examQuestion.update({
      where: { id: params.id },
      data: {
        ...(type && { type }),
        ...(content && { content }),
        ...(order !== undefined && { order }),
        ...(points !== undefined && { points }),
        ...(language !== undefined && { language }),
        ...(options !== undefined && { options }),
        ...(correctAnswers !== undefined && { correctAnswers }),
      },
    });

    return NextResponse.json({
      message: 'Вопрос успешно обновлен!',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обновлении вопроса.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Мяу! Нужно авторизоваться.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Котик не найден.' },
        { status: 404 }
      );
    }

    const question = await prisma.examQuestion.findUnique({
      where: { id: params.id },
      include: {
        exam: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Вопрос не найден.' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this exam
    if (question.exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому вопросу.' },
        { status: 403 }
      );
    }

    await prisma.examQuestion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Вопрос успешно удален!',
    });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при удалении вопроса.' },
      { status: 500 }
    );
  }
}
