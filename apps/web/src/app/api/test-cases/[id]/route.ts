import { prisma } from '@repo/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

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

    const testCase = await prisma.testCase.findUnique({
      where: { id: params.id },
      include: {
        question: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!testCase) {
      return NextResponse.json(
        { error: 'Тестовый случай не найден.' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this exam
    if (testCase.question.exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому тестовому случаю.' },
        { status: 403 }
      );
    }

    const {
      input,
      expectedOutput,
      points,
      timeout,
      isHidden,
    } = await req.json();

    const updatedTestCase = await prisma.testCase.update({
      where: { id: params.id },
      data: {
        ...(input && { input }),
        ...(expectedOutput && { expectedOutput }),
        ...(points !== undefined && { points }),
        ...(timeout !== undefined && { timeout }),
        ...(isHidden !== undefined && { isHidden }),
      },
    });

    return NextResponse.json({
      message: 'Тестовый случай успешно обновлен!',
      testCase: updatedTestCase,
    });
  } catch (error) {
    console.error('Update test case error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при обновлении тестового случая.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

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

    const testCase = await prisma.testCase.findUnique({
      where: { id: params.id },
      include: {
        question: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!testCase) {
      return NextResponse.json(
        { error: 'Тестовый случай не найден.' },
        { status: 404 }
      );
    }

    // Check if user is the teacher of this exam
    if (testCase.question.exam.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Мяу! Нет прав доступа к этому тестовому случаю.' },
        { status: 403 }
      );
    }

    await prisma.testCase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Тестовый случай успешно удален!',
    });
  } catch (error) {
    console.error('Delete test case error:', error);
    return NextResponse.json(
      { error: 'Что-то пошло не так при удалении тестового случая.' },
      { status: 500 }
    );
  }
}
