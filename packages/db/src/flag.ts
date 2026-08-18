import { createHash, timingSafeEqual } from 'node:crypto';

function normalizeFlag(flag: string) {
  return flag.trim();
}

export function hashFlag(flag: string) {
  return createHash('sha256').update(normalizeFlag(flag)).digest('hex');
}

export function verifyFlag(submittedFlag: string, flagHash: string) {
  const submittedHash = Buffer.from(hashFlag(submittedFlag), 'hex');
  const expectedHash = Buffer.from(flagHash, 'hex');

  if (submittedHash.length !== expectedHash.length) return false;

  return timingSafeEqual(submittedHash, expectedHash);
}
