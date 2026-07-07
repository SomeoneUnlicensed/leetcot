// Verifies the real ALTCHA round trip against the running dev server: fetch a
// challenge from the actual /api/captcha route (public, no auth needed),
// solve it with altcha-lib's own solver, then verify the solution with the
// exact same altcha-lib.verifySolution() the real /api/execute route calls,
// using the same ALTCHA_HMAC_KEY from .env.
import { verifySolution, solveChallenge } from 'altcha-lib/v1';

const res = await fetch('http://localhost:3010/api/captcha');
if (!res.ok) {
  console.error('FAIL: /api/captcha returned', res.status, await res.text());
  process.exit(1);
}
const challenge = await res.json();
console.log('Challenge from server:', challenge);

const { promise } = solveChallenge(challenge.challenge, challenge.salt, challenge.algorithm, challenge.maxnumber);
const solution = await promise;
if (!solution) {
  console.error('FAIL: could not solve challenge within maxnumber');
  process.exit(1);
}
console.log('Solved with number:', solution.number, `(${solution.took}ms)`);

const payload = Buffer.from(
  JSON.stringify({
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    number: solution.number,
    salt: challenge.salt,
    signature: challenge.signature,
  }),
).toString('base64');

const hmacKey = process.env.ALTCHA_HMAC_KEY;
const valid = await verifySolution(payload, hmacKey);
console.log('verifySolution result:', valid);

// Negative check: tampered payload must be rejected.
const tamperedPayload = Buffer.from(
  JSON.stringify({
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    number: solution.number + 1,
    salt: challenge.salt,
    signature: challenge.signature,
  }),
).toString('base64');
const tamperedValid = await verifySolution(tamperedPayload, hmacKey);
console.log('verifySolution result for tampered (wrong number) payload:', tamperedValid);

if (!valid || tamperedValid) {
  console.error('FAIL: expected valid=true, tamperedValid=false');
  process.exit(1);
}
console.log('\nOK: full ALTCHA round trip (issue -> solve -> verify) works, and tampering is rejected.');
