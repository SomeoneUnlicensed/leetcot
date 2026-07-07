import { randomBytes } from 'node:crypto';

let devHmacKey: string | undefined;

// Shared between /api/captcha (issues challenges) and /api/execute (verifies
// solutions). Resolve lazily so Next.js can import route modules during
// production builds without needing the runtime-only secret.
export function getAltchaHmacKey(): string {
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
  devHmacKey ??= randomBytes(32).toString('hex');
  return devHmacKey;
}
