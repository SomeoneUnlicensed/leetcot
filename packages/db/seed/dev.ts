import { faker } from '@faker-js/faker';
import { PrismaClient, type Prisma } from '@prisma/client';
import uuidByString from 'uuid-by-string';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestChallenges } from './data/challenge-ingest';
import { createComment } from '../mocks/comment.mock';
import { createUsers } from '../mocks/user.mock';
import { tracks } from './data/tracks';
import { courses } from './data/courses';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const challengePath = path.join(__dirname, '../../../challenges');

const prisma = new PrismaClient();

export const slugify = (str: string) => str.toLowerCase().replace(/\s/g, '-');
export const trashId = uuidByString('trash');
export const gId = uuidByString('g');

const solutionTitles = [
  'Решение через рекурсию',
  'Итеративный подход',
  'Используя mapped types',
  'Решение с conditional types',
  'Простое решение',
  'Оптимальный вариант',
  'Через infer и template literals',
  'С помощью generic constraints',
  'Кошачье решение 🐱',
  'Минималистичный подход',
];

const solutionDescs = [
  'Использовал рекурсивные типы для обхода вложенных структур.',
  'Простой и понятный подход без лишних усложнений.',
  'Ключевая идея — conditional types и infer.',
  'Решение основано на mapped types с фильтрацией ключей.',
  'Нашёл элегантный способ через template literal types.',
  'Применил distributive conditional types для обработки union.',
];

function alotOfSharedSolutions(challengeId: number) {
  return Array.from({ length: 50 }, (_, i) => ({
    challengeId,
    title: solutionTitles[i % solutionTitles.length]!,
    description: solutionDescs[i % solutionDescs.length]!,
  }));
}

try {
  const TYPEHERO_ID = uuidByString('typehero');

  const adminRole = await prisma.role.upsert({
    where: { role: 'ADMIN' },
    update: {},
    create: { role: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { role: 'USER' },
    update: {},
    create: { role: 'USER' },
  });

  const typeHeroUser = await prisma.user.upsert({
    where: { id: TYPEHERO_ID },
    update: {
      password: bcrypt.hashSync('admin123', 10),
      roles: {
        connect: [
          { id: adminRole.id },
          { id: userRole.id },
        ],
      },
    },
    create: {
      id: TYPEHERO_ID,
      email: 'admin@leetcot.ru',
      name: 'ЛитКот',
      password: bcrypt.hashSync('admin123', 10),
      roles: {
        connect: [
          { id: adminRole.id },
          { id: userRole.id },
        ],
      },
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

  const trackChallengeSlugs: Record<string, string[]> = {
    'crafting-typescript-utility-types': [
      'cat-typescript-utility-types',
      'pick',
    ],
    'typescript-wizardry': [
      'cat-typescript-generics',
      'default-generic-arguments',
    ],
    'javascript-built-in-methods': [
      'cat-javascript-basics',
      'index-signatures',
    ],
    'understanding-typescript-syntax': [
      'type-aliases',
      'type-unions',
      'typeof',
      'literal-types',
    ],
    'typescript-foundations': [
      'generic-function-arguments',
      'generic-type-arguments',
      'generic-type-constraints',
      'indexed-types',
      'keyof',
      'primitive-data-types',
      'mapped-object-types',
    ],
    'advent-of-typescript-2023': Array.from({ length: 25 }, (_, i) => `2023-${i + 1}`),
    'advent-of-typescript-2024': Array.from({ length: 25 }, (_, i) => `2024-${i + 1}`),
  };

  for (const track of tracks) {
    const createdTrack = await prisma.track.create({
      data: {
        name: track.name,
        slug: track.slug || slugify(track.name),
        description: track.description,
        visible: true,
      },
    });

    createdTracksMap.set(createdTrack.slug, createdTrack);

    const targetSlugs = trackChallengeSlugs[createdTrack.slug] || [];
    const challenges = await prisma.challenge.findMany({
      where: {
        slug: {
          in: targetSlugs,
        },
      },
    });

    const orderedChallenges = challenges.sort((a, b) => {
      return targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug);
    });

    await prisma.trackChallenge.createMany({
      data: orderedChallenges.map((challenge, index) => ({
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
