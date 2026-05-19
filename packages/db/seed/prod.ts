// if you want a similar db to what prod looks like.
// this should never be run on prod directly
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import uuidByString from 'uuid-by-string';
import { prisma } from '../src';
import { ingestChallenges } from './data/challenge-ingest';
import { tracks } from './data/tracks';

import { courses } from './data/courses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const challengePath = path.join(__dirname, '../../../challenges');

const slugify = (str: string) => str.toLowerCase().replace(/\s/g, '-');
const LEETCOT_ID = uuidByString('leetcot');

try {
  const typeHeroUser = await prisma.user.upsert({
    where: { id: LEETCOT_ID },
    update: {},
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

  const challengesToCreate = await ingestChallenges(challengePath);

  await prisma.challenge.createMany({
    data: challengesToCreate.map(({ author: _, ...challenge }) => ({
      ...challenge,
      userId: typeHeroUser.id,
    })),
  });

  const createdTracksMap = new Map<string, any>();

  for (const track of tracks) {
    const createdTrack = await prisma.track.create({
      data: {
        name: track.name,
        slug: track.slug || slugify(track.name),
        description: track.description,
        visible: true,
        isComingSoon: track.slug !== 'typescript-foundations',
      },
    });

    createdTracksMap.set(createdTrack.slug, createdTrack);

    if (createdTrack.slug === 'advent-of-typescript-2023') {
      const challengesForTrack = await prisma.challenge.findMany({
        where: {
          slug: {
            in: [
              '2023-1',
              '2023-2',
              '2023-3',
              '2023-4',
              '2023-5',
              '2023-6',
              '2023-7',
              '2023-8',
              '2023-9',
              '2023-10',
              '2023-11',
              '2023-12',
              '2023-13',
              '2023-14',
              '2023-15',
              '2023-16',
              '2023-17',
              '2023-18',
              '2023-19',
              '2023-20',
              '2023-21',
              '2023-22',
              '2023-23',
              '2023-24',
              '2023-25',
            ],
          },
        },
      });
      await prisma.trackChallenge.createMany({
        data: challengesForTrack.map((challenge, index) => ({
          challengeId: challenge.id,
          trackId: createdTrack.id,
          orderId: index,
        })),
      });
    }

    if (createdTrack.slug === 'advent-of-typescript-2024') {
      const challengesForTrack = await prisma.challenge.findMany({
        where: {
          slug: {
            in: [
              '2024-1',
              '2024-2',
              '2024-3',
              '2024-4',
              '2024-5',
              '2024-6',
              '2024-7',
              '2024-8',
              '2024-9',
              '2024-10',
              '2024-11',
              '2024-12',
              '2024-13',
              '2024-14',
              '2024-15',
              '2024-16',
              '2024-17',
              '2024-18',
              '2024-19',
              '2024-20',
              '2024-21',
              '2024-22',
              '2024-23',
              '2024-24',
              '2024-25',
            ],
          },
        },
      });
      await prisma.trackChallenge.createMany({
        data: challengesForTrack.map((challenge, index) => ({
          challengeId: challenge.id,
          trackId: createdTrack.id,
          orderId: index,
        })),
      });
    }

    if (createdTrack.slug === 'typescript-foundations') {
      const challengesForTrack = await prisma.challenge.findMany({
        where: {
          slug: {
            in: [
              'generic-function-arguments',
              'generic-type-arguments',
              'generic-type-constraints',
              'index-signatures',
              'indexed-types',
              'keyof',
              'literal-types',
              'mapped-object-types',
              'primitive-data-types',
              'type-aliases',
              'type-unions',
              'typeof',
            ],
          },
        },
      });
      await prisma.trackChallenge.createMany({
        data: challengesForTrack.map((challenge, index) => ({
          challengeId: challenge.id,
          trackId: createdTrack.id,
          orderId: index,
        })),
      });
    }
  }

  // Seed courses and link tracks to them
  for (const course of courses) {
    const createdCourse = await prisma.course.create({
      data: {
        name: course.name,
        slug: course.slug,
        description: course.description,
        visible: true,
      },
    });

    for (const trackSlug of course.trackSlugs) {
      const dbTrack = createdTracksMap.get(trackSlug);
      if (dbTrack) {
        await prisma.track.update({
          where: { id: dbTrack.id },
          data: { courseId: createdCourse.id },
        });
      }
    }
  }

  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}
