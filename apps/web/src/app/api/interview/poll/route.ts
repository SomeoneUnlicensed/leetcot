import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const events = await prisma.interviewEvent.findMany({
    where: { sessionId: id },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  const lastCodeEvent = events.find((e) => e.type === 'CODE_CHANGE' || e.type === 'SUBMIT');
  const code = lastCodeEvent?.payload && typeof lastCodeEvent.payload === 'object' && 'code' in lastCodeEvent.payload
    ? (lastCodeEvent.payload as { code?: string }).code
    : null;

  return NextResponse.json({
    code,
    events: events.reverse(),
  });
}
