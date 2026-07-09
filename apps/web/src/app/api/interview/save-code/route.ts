import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId, challengeId, code, passedTests, totalTests, isSubmitted } = await req.json();

    await prisma.interviewChallenge.update({
      where: { id: challengeId },
      data: { code, passedTests, totalTests, isSubmitted: isSubmitted ?? false },
    });

    await prisma.interviewEvent.create({
      data: {
        sessionId,
        type: isSubmitted ? 'SUBMIT' : 'CODE_CHANGE',
        payload: { code, passedTests, totalTests },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save code error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
