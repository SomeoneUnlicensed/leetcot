// altcha-lib's own types are declared via a package.json `exports` map that
// isn't resolvable under this repo's `moduleResolution: "node"` (see
// tooling/config-typescript/base.json — a repo-wide setting, not worth
// changing just for this). Ambient-declare the small slice we actually use.
//
// Deliberately using the `/v1` entry point, not the package's default (v2)
// export — v2 replaces the simple hash challenge with a key-derivation
// (PBKDF2/Argon2/Scrypt) flow that needs a matching `deriveKey` on both ends.
// v1's plain hash challenge is what the bundled `altcha-widget` element
// solves by default and is the one actually documented for simple
// client+server pairing; no need for the extra complexity here.
declare module 'altcha-lib/v1' {
  export interface Challenge {
    algorithm: string;
    challenge: string;
    maxnumber?: number;
    salt: string;
    signature: string;
  }

  export interface ChallengeOptions {
    algorithm?: string;
    expires?: Date;
    hmacKey: string;
    maxNumber?: number;
    params?: Record<string, string>;
    saltLength?: number;
  }

  export function createChallenge(options: ChallengeOptions): Promise<Challenge>;
  export function verifySolution(
    payload: string,
    hmacKey: string,
    checkExpires?: boolean,
  ): Promise<boolean>;
}
