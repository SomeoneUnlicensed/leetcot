import { createChallenge } from 'altcha-lib/v1';
import { NextResponse } from 'next/server';
import { getAltchaHmacKey } from '~/server/altcha';

// The <altcha-widget> fetches this on load to get a fresh proof-of-work
// challenge to solve in the background before the user ever hits submit.
export async function GET() {
  const challenge = await createChallenge({
    hmacKey: getAltchaHmacKey(),
    maxNumber: 100_000,
  });

  return NextResponse.json(challenge);
}
