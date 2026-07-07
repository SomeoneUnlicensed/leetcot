import { randomBytes } from 'node:crypto';

// Shared between /api/captcha (issues challenges) and /api/execute (verifies
// solutions) — both must sign/verify with the exact same key, so this is
// resolved once per server process rather than read from env separately in
// each route.
function resolveHmacKey(): string {
  const configured = process.env.ALTCHA_HMAC_KEY;
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ALTCHA_HMAC_KEY must be set in production to enable the submit-form captcha.',
    );
  }

  console.warn(
    '[altcha] ALTCHA_HMAC_KEY is not set — using an ephemeral dev-only key. Set it in .env for a stable key across restarts.',
  );
  return randomBytes(32).toString('hex');
}

export const ALTCHA_HMAC_KEY = resolveHmacKey();
