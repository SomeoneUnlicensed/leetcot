import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const expectedToken = process.env.SENTRY_TEST_TOKEN;
  const actualToken = req.headers.get('x-sentry-test-token');

  if (!expectedToken || actualToken !== expectedToken) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const eventId = Sentry.captureException(new Error('LeetCot web Sentry smoke test'));
  await Sentry.flush(2000);

  return NextResponse.json({ eventId, ok: true });
}
