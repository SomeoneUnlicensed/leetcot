import { type Session } from '@repo/auth/server';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getAllFlags } from '~/utils/feature-flags';
import { validateCompilerOptions } from '~/utils/validateCompilerOptions';

export type ChallengeRouteData = NonNullable<Awaited<ReturnType<typeof getChallengeRouteData>>>;

// SQL challenges are ingested without a `user.sql` starter file, so `code` ends up
// holding the raw `solution.sql` contents, and `tests` holds the answer key (a
// fixed bank of pre-computed `cases`, each with its own seed SQL + expected rows).
// This object gets serialized straight into the client bundle (SqlTerminal only
// needs `schema`/`seed` to run the local sandbox), so strip anything answer-revealing
// before it ever leaves the server. Grading itself never uses this — /api/execute
// re-fetches `tests` fresh from the DB independently.
function sanitizeSqlTestsForClient(rawTests: string): string {
  try {
    const parsed = JSON.parse(rawTests) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cases, ...clientSafe } = parsed;
    return JSON.stringify(clientSafe);
  } catch {
    return rawTests;
  }
}

// Must match packages/code-runner's PYTHON_HIDDEN_TESTS_MARKER — everything after
// this marker is the hidden fixed test-case bank (+ the generator needed to
// reconstruct each case's input), appended to the same `tests` field that's
// otherwise shown verbatim in the student's "Tests" editor pane. Strip it before
// that pane's content reaches the client; code-runner reads the untruncated value
// straight from the DB.
const PYTHON_HIDDEN_TESTS_MARKER = '# ---LEETCOT-HIDDEN-TESTS---';
const GO_HIDDEN_TESTS_MARKER = '// ---LEETCOT-HIDDEN-TESTS---';

function sanitizePythonTestsForClient(rawTests: string): string {
  const markerIndex = rawTests.indexOf(PYTHON_HIDDEN_TESTS_MARKER);
  return markerIndex === -1 ? rawTests : rawTests.slice(0, markerIndex).trimEnd();
}

function sanitizeGoTestsForClient(rawTests: string): string {
  const markerIndex = rawTests.indexOf(GO_HIDDEN_TESTS_MARKER);
  return markerIndex === -1 ? rawTests : rawTests.slice(0, markerIndex).trimEnd();
}

function sanitizeExecutableTestsForClient(rawTests: string): string {
  return sanitizeGoTestsForClient(sanitizePythonTestsForClient(rawTests));
}

function sanitizeTestsForClient(language: string, rawTests: string): string {
  if (language === 'SQL') {
    return sanitizeSqlTestsForClient(rawTests);
  }

  if (language === 'GO') {
    return '';
  }

  return sanitizeExecutableTestsForClient(rawTests);
}

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
    const index = trackForNavigation.trackChallenges.findIndex(
      (x) => x.challengeId === challenge.id,
    );
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
      ...(challenge.language === 'SQL'
        ? {
            // The starter `code` is actually solution.sql for SQL challenges today
            // (no user.sql file exists in challenges/sql-cat-*) — never ship it.
            code: '',
          }
        : {}),
      tests: sanitizeTestsForClient(challenge.language, challenge.tests),
    },
    track: trackForNavigation,
    nextChallenge,
  };
});
export type GetCurrentChallengeType = ChallengeRouteData['challenge'];

export const isEnrolledInAnyTrack = cache(async (session: Session | null) => {
  if (!session?.user?.id) {
    return false;
  }
  const userWithTrackCount = await prisma.user.findUnique({
    where: { id: session?.user?.id },
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
