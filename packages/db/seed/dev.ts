import { faker } from '@faker-js/faker';
import { PrismaClient, type Challenge, type Prisma } from '@prisma/client';
import uuidByString from 'uuid-by-string';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestChallenges } from './data/challenge-ingest';
import { createComment } from '../mocks/comment.mock';
import { createUsers } from '../mocks/user.mock';
import { tracks } from './data/tracks';
import { courses } from './data/courses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const challengePath = path.join(__dirname, '../../../challenges');

const prisma = new PrismaClient();

export const slugify = (str: string) => str.toLowerCase().replace(/\s/g, '-');
export const trashId = uuidByString('trash');
export const gId = uuidByString('g');

try {
  const TYPEHERO_ID = uuidByString('typehero');
  const typeHeroUser = await prisma.user.upsert({
    where: { id: TYPEHERO_ID },
    update: {},
    create: {
      id: TYPEHERO_ID,
      email: 'admin@leetcot.ru',
      name: 'ЛитКот',
    },
  });

  await prisma.user.createMany({
    data: createUsers(15),
  });

  const localChallenges = await ingestChallenges(challengePath);

  await prisma.challenge.createMany({
    data: localChallenges.map(({ author: _, ...challenge }) => ({
      ...challenge,
      userId: typeHeroUser.id,
    })),
  });

  const createdTracksMap = new Map<string, any>();

  for (const [index, track] of tracks.entries()) {
    const challenges = await getRandomChallenges(index);

    const createdTrack = await prisma.track.create({
      data: {
        name: track.name,
        slug: track.slug || slugify(track.name),
        description: track.description,
        visible: true,
      },
    });

    createdTracksMap.set(createdTrack.slug, createdTrack);

    await prisma.trackChallenge.createMany({
      data: challenges.map((challenge, index) => ({
        challengeId: challenge.id,
        trackId: createdTrack.id,
        orderId: index,
      })),
    });
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
  const someChallenge = await prisma.challenge.findFirst({
    where: {
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { id: trashId },
    update: {},
    create: {
      id: trashId,
      email: 'chris@leetcot.ru',
      name: 'chris',
      sharedSolution: {
        create: alotOfSharedSolutions(someChallenge?.id ?? 2),
      },
    },
  });

  let commentNum = 0;
  const comments = Array.from({ length: 50 }, () => createComment(++commentNum));

  const replies: Prisma.CommentCreateManyInput[] = [];

  const { comment: createdComments } = await prisma.challenge.update({
    where: { id: someChallenge?.id },
    include: {
      comment: true,
    },
    data: {
      comment: {
        create: comments,
      },
    },
  });

  for (const comment of createdComments) {
    replies.push(createComment(++commentNum, comment.id), createComment(++commentNum, comment.id));
  }

  await prisma.challenge.update({
    where: { id: someChallenge?.id },
    data: {
      comment: {
        create: replies,
      },
    },
  });

  await prisma.$disconnect();
} catch (e) {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}

async function getRandomChallenges(iteration: number): Promise<Challenge[]> {
  const challenges = await prisma.challenge.findMany({
    take: 10,
    skip: 10 * iteration,
  });
  return challenges;
}

function alotOfSharedSolutions(challengeId: number) {
  return Array.from({ length: 50 }, () => ({
    challengeId,
    title: faker.lorem.words(7),
    description: faker.lorem.words({ min: 5, max: 25 }),
  }));
}
