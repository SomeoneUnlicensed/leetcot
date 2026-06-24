import path from 'node:path';
import { fileURLToPath } from 'node:url';
import uuidByString from 'uuid-by-string';
import { prisma } from '../src';
import { ingestChallenges } from './data/challenge-ingest';
import { courses } from './data/courses';
import { tracks } from './data/tracks';

const SQL_TRACK_SLUG = 'sql-cat-fishing';
const SQL_COURSE_SLUG = 'sql-cat-tables';
const SQL_CHALLENGE_SLUGS = [
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
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const challengePath = path.join(__dirname, '../../../challenges');
const LEETCOT_ID = uuidByString('leetcot');

try {
  const author = await prisma.user.upsert({
    where: { id: LEETCOT_ID },
    update: {
      email: 'admin@leetcot.ru',
      name: 'ЛитКот',
    },
    create: {
      id: LEETCOT_ID,
      email: 'admin@leetcot.ru',
      name: 'ЛитКот',
      userLinks: {
        create: {
          url: 'https://leetcot.ru',
        },
      },
    },
  });

  const sqlChallenges = (await ingestChallenges(challengePath)).filter((challenge) =>
    SQL_CHALLENGE_SLUGS.includes(challenge.slug ?? ''),
  );

  for (const challenge of sqlChallenges) {
    const { author: _, ...challengeData } = challenge;

    await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: {
        ...challengeData,
        userId: author.id,
      },
      create: {
        ...challengeData,
        userId: author.id,
      },
    });
  }

  const sqlTrack = tracks.find((track) => track.slug === SQL_TRACK_SLUG);

  if (!sqlTrack) {
    throw new Error(`Track config not found: ${SQL_TRACK_SLUG}`);
  }

  const createdTrack = await prisma.track.upsert({
    where: { slug: sqlTrack.slug },
    update: {
      description: sqlTrack.description,
      name: sqlTrack.name,
      visible: true,
    },
    create: {
      description: sqlTrack.description,
      name: sqlTrack.name,
      slug: sqlTrack.slug,
      visible: true,
    },
  });

  const dbChallenges = await prisma.challenge.findMany({
    where: {
      slug: {
        in: SQL_CHALLENGE_SLUGS,
      },
    },
  });
  const orderedChallenges = dbChallenges.sort(
    (a, b) => SQL_CHALLENGE_SLUGS.indexOf(a.slug) - SQL_CHALLENGE_SLUGS.indexOf(b.slug),
  );

  await prisma.trackChallenge.deleteMany({
    where: { trackId: createdTrack.id },
  });
  await prisma.trackChallenge.createMany({
    data: orderedChallenges.map((challenge, index) => ({
      challengeId: challenge.id,
      orderId: index,
      trackId: createdTrack.id,
    })),
  });

  const sqlCourse = courses.find((course) => course.slug === SQL_COURSE_SLUG);

  if (!sqlCourse) {
    throw new Error(`Course config not found: ${SQL_COURSE_SLUG}`);
  }

  const createdCourse = await prisma.course.upsert({
    where: { slug: sqlCourse.slug },
    update: {
      description: sqlCourse.description,
      name: sqlCourse.name,
      visible: true,
    },
    create: {
      description: sqlCourse.description,
      name: sqlCourse.name,
      slug: sqlCourse.slug,
      visible: true,
    },
  });

  await prisma.track.update({
    where: { id: createdTrack.id },
    data: { courseId: createdCourse.id },
  });

  console.log(
    `SQL course seed completed: ${orderedChallenges.length}/${SQL_CHALLENGE_SLUGS.length} challenges linked.`,
  );
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
