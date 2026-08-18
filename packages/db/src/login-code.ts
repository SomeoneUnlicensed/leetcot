import { randomInt } from 'node:crypto';

// Crockford-ish alphabet: no 0/O, 1/I/L, so codes are easy to read aloud and type.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateLoginCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET.charAt(randomInt(ALPHABET.length));
  }
  return code;
}
