'use server';
import { auth } from '~/server/auth';
import type { Challenge } from '@repo/db/types';
import { getRecommendedChallenges } from './recommend-challenges';

/**
 * Get similar **unsolved** challenges for the given challengeId
 * 1. Get challenges with same `difficulty` that are unsolved
 * 2. Get random unsolved challenges if no problems exist for same `difficulty` that are unsolved
 * @param {number} challengeId challengeId of the challenge
 * @param {number} [maxChallenges=2] maximum number of similar challenges to return records to find
 * @returns {Promise<Challenge[]>} challenge array promise
 */
export async function getSimilarChallenges(
  challengeId: number,
  maxChallenges = 2,
): Promise<Challenge[]> {
  try {
    const session = await auth();
    return await getRecommendedChallenges({
      currentChallengeId: challengeId,
      userId: session?.user?.id,
      maxChallenges,
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}
