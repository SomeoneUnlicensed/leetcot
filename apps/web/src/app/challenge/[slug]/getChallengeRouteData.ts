import { type Session } from '@repo/auth/server';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAllFlags } from '~/utils/feature-flags';
import { validateCompilerOptions } from '~/utils/validateCompilerOptions';

export type ChallengeRouteData = NonNullable<Awaited<ReturnType<typeof getChallengeRouteData>>>;

// this is to data to populate the description tab (default tab on challenge page)
export const getChallengeRouteData = cache(async (slug: string, session: Session | null) => {
  const featureFlags = await getAllFlags();

  const challenge = await prisma.challenge.findFirst({
    where: {
      slug,
      status: 'ACTIVE',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          roles: true,
          bio: true,
          image: true,
        },
      },
      _count: {
        select: {
          vote: true,
        },
      },
      vote: {
        where: {
          userId: session?.user?.id || '',
        },
      },
      bookmark: {
        where: {
          userId: session?.user?.id || '',
        },
      },
      submission: {
        where: {
          userId: session?.user?.id || '',
          isSuccessful: true,
        },
        take: 1,
      },
    },
  });

  if (!challenge) {
    notFound();
  }

  const tsconfig = challenge.tsconfig;
  if (!validateCompilerOptions(tsconfig)) {
    throw new Error(`Challenge "${challenge.slug}" has an invalid tsconfig`);
  }

  /**
   * Select the first track that the user is enrolled in for this challenge.
   */
  let trackForNavigation = null;
  if (featureFlags?.enableInChallengeTrack && session) {
    trackForNavigation = await prisma.track.findFirst({
      where: {
        trackChallenges: {
          some: {
            challengeId: challenge.id,
            track: {
              enrolledUsers: {
                some: {
                  id: session.user?.id,
                },
              },
            },
          },
        },
      },
      include: {
        trackChallenges: {
          orderBy: {
            orderId: 'asc',
          },
          include: {
            challenge: {
              select: {
                slug: true,
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });
  }

  if (!trackForNavigation) {
    trackForNavigation = await prisma.track.findFirst({
      where: {
        trackChallenges: {
          some: {
            challengeId: challenge.id,
          },
        },
      },
      include: {
        trackChallenges: {
          orderBy: {
            orderId: 'asc',
          },
          include: {
            challenge: {
              select: {
                slug: true,
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });
  }

  let nextChallenge: { slug: string; name: string } | null = null;
  if (trackForNavigation) {
    const index = trackForNavigation.trackChallenges.findIndex((x) => x.challengeId === challenge.id);
    if (index !== -1 && index + 1 < trackForNavigation.trackChallenges.length) {
      const nextChallengeData = trackForNavigation.trackChallenges[index + 1]?.challenge;
      if (nextChallengeData) {
        nextChallenge = {
          slug: nextChallengeData.slug,
          name: nextChallengeData.name,
        };
      }
    }
  }

  if (!nextChallenge) {
    const globalNext = await prisma.challenge.findFirst({
      where: {
        id: {
          gt: challenge.id,
        },
        status: 'ACTIVE',
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        slug: true,
        name: true,
      },
    });
    if (globalNext) {
      nextChallenge = globalNext;
    }
  }

  return {
    challenge: {
      ...challenge,
      hasSolved: challenge.submission.length > 0,
      tsconfig,
    },
    track: trackForNavigation,
    nextChallenge,
  };
});
export type GetCurrentChallengeType = ChallengeRouteData['challenge'];

export const isEnrolledInAnyTrack = cache(async (session: Session | null) => {
  if (!session || !session.user?.id) {
    return false;
  }
  const userWithTrackCount = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: { tracks: true },
      },
    },
  });

  const numberOfTrack = userWithTrackCount?._count.tracks;
  if (!numberOfTrack) {
    return false;
  }
  return true;
});
