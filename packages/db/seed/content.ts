import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestChallenges } from './data/challenge-ingest';
import { courses } from './data/courses';
import { tracks } from './data/tracks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const challengePath = path.join(__dirname, '../../../challenges');

const prisma = new PrismaClient();

const LITKOT_EMAIL = 'admin@leetcot.ru';
const LITKOT_NAME = 'ЛитКот';

const trackChallengeSlugs: Record<string, string[]> = {
  'python-start-cats': [
    'python-fish-even-catch',
    'python-fish-rotate-bowls',
    'python-fish-compact-bowls',
    'python-fish-dedup-order',
    'python-fish-max-streak',
    'python-fish-snack-counter',
    'python-fish-kitten-scores',
    'python-fish-brackets',
    'python-fish-palindrome',
    'python-fish-purr-window',
    'python-fish-prefix-patrol',
  ],
  'python-algo-fishing': [
    'python-fish-even-catch',
    'python-fish-twosum',
    'python-fish-palindrome',
    'python-fish-binary-search',
    'python-fish-stack',
    'python-fish-sort',
    'python-fish-sliding-window',
    'python-fish-rotate-bowls',
    'python-fish-compact-bowls',
    'python-fish-dedup-order',
    'python-fish-max-streak',
    'python-fish-snack-counter',
    'python-fish-yarn',
    'python-fish-kitten-scores',
    'python-fish-brackets',
    'python-fish-purr-window',
    'python-fish-prefix-patrol',
    'python-fish-range-summary',
    'python-fish-top-snacks',
    'python-fish-islands',
    'python-fish-grid-path',
    'python-fish-tree',
    'python-fish-heap',
    'python-fish-graph',
    'python-fish-dp',
    'python-fish-backtracking',
    'python-fish-dijkstra',
    'python-fish-merge-intervals',
    'python-fish-stock-trade',
    'python-fish-valid-anagram',
    'python-fish-key-maze',
    'python-fish-min-crates',
    'python-fish-ration-plans',
  ],
  'sql-cat-fishing': [
    'sql-cat-intro',
    'sql-cat-sort-fish',
    'sql-cat-small-portions',
    'sql-cat-vip-menu',
    'sql-cat-empty-bowls',
    'sql-cat-price-tags',
    'sql-cat-top-snacks',
    'sql-cat-second-page',
    'sql-cat-feeders',
    'sql-cat-average-catch',
    'sql-cat-hungry',
    'sql-cat-having-hunters',
    'sql-cat-feeder-leftovers',
    'sql-cat-never-fed',
    'sql-cat-pair-count',
    'sql-cat-thief',
    'sql-cat-impostor',
    'sql-cat-subquery-heavy',
    'sql-cat-exists-lost-badge',
    'sql-cat-union-pantry',
    'sql-cat-date-expiry',
    'sql-cat-anti-cheat-duplicates',
    'sql-cat-guard',
    'sql-cat-stale',
    'sql-cat-no-award',
    'sql-cat-tax',
    'sql-cat-insert-kitten',
    'sql-cat-update-ration',
    'sql-cat-delete-spoiled',
    'sql-cat-transaction-log',
    'sql-cat-normalize-awards',
    'sql-cat-build-summary',
    'sql-cat-window-medals',
    'sql-cat-running-fish',
    'sql-cat-lag-progress',
    'sql-cat-safe-division',
    'sql-cat-cross-tab',
    'sql-cat-self-join-friends',
    'sql-cat-fishing-rank',
  ],
  'golang-service-start': [
    'go-cat-full-bowls',
    'go-cat-snack-index',
    'go-cat-purr-window',
    'go-cat-ration-log',
    'go-cat-feeding-order',
    'go-cat-portal-router',
  ],
};

async function main() {
  const litkotUser = await prisma.user.findFirst({
    where: { email: LITKOT_EMAIL },
    select: { id: true },
  });

  if (!litkotUser) {
    throw new Error(`Seed user not found: ${LITKOT_EMAIL}`);
  }

  const localChallenges = await ingestChallenges(challengePath);
  console.log(`Content seed found ${localChallenges.length} challenges.`);

  for (const challenge of localChallenges) {
    const { author, ...challengeData } = challenge;
    const userId = author === LITKOT_NAME ? litkotUser.id : litkotUser.id;

    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: {
        ...challengeData,
        userId,
      },
      create: {
        ...challengeData,
        userId,
      },
    });
  }

  const createdTracks = new Map<string, { id: number; slug: string }>();

  for (const track of tracks) {
    const createdTrack = await prisma.track.upsert({
      where: { slug: track.slug },
      update: {
        name: track.name,
        description: track.description,
        visible: true,
        isComingSoon: false,
      },
      create: {
        name: track.name,
        slug: track.slug,
        description: track.description,
        visible: true,
        isComingSoon: false,
      },
    });

    createdTracks.set(createdTrack.slug, createdTrack);

    const targetSlugs = trackChallengeSlugs[createdTrack.slug] ?? [];
    const dbChallenges = await prisma.challenge.findMany({
      where: { slug: { in: targetSlugs } },
      select: { id: true, slug: true },
    });
    const orderedChallenges = dbChallenges.sort(
      (a, b) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug),
    );

    await prisma.trackChallenge.deleteMany({ where: { trackId: createdTrack.id } });
    await prisma.trackChallenge.createMany({
      data: orderedChallenges.map((challenge, index) => ({
        challengeId: challenge.id,
        orderId: index,
        trackId: createdTrack.id,
      })),
    });

    if (orderedChallenges.length !== targetSlugs.length) {
      console.warn(
        `Track ${createdTrack.slug} linked ${orderedChallenges.length}/${targetSlugs.length} challenges.`,
      );
    }
  }

  for (const course of courses) {
    const createdCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        name: course.name,
        description: course.description,
        visible: true,
        isComingSoon: false,
      },
      create: {
        name: course.name,
        slug: course.slug,
        description: course.description,
        visible: true,
        isComingSoon: false,
      },
    });

    for (const trackSlug of course.trackSlugs) {
      const track = createdTracks.get(trackSlug);
      if (!track) {
        console.warn(`Course ${course.slug} references missing track ${trackSlug}.`);
        continue;
      }

      await prisma.track.update({
        where: { id: track.id },
        data: { courseId: createdCourse.id },
      });
    }
  }

  console.log('Content seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
