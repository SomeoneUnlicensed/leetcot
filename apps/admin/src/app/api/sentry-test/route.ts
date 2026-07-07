import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await import('../../../../sentry.server.config');

  const expectedToken = process.env.SENTRY_TEST_TOKEN;
  const actualToken = req.headers.get('x-sentry-test-token');

  if (!expectedToken || actualToken !== expectedToken) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const eventId = Sentry.captureException(new Error('LeetCot admin Sentry smoke test'));
  const flushOk = await Sentry.flush(5000);

  return NextResponse.json({ eventId, flushOk, ok: true });
}
