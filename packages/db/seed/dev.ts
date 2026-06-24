import { PrismaClient } from '@prisma/client';
import uuidByString from 'uuid-by-string';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ingestChallenges } from './data/challenge-ingest';
import { tracks } from './data/tracks';
import { courses } from './data/courses';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const challengePath = path.join(__dirname, '../../../challenges');

const prisma = new PrismaClient();

export const slugify = (str: string) => str.toLowerCase().replace(/\s/g, '-');

async function main() {
  const args = process.argv.slice(2).map((arg) => arg.replace(/^['"]|['"]$/g, ''));
  const emailArg = args.find((arg) => arg.startsWith('--email='));
  const passwordArg = args.find((arg) => arg.startsWith('--password='));

  const adminEmail = emailArg ? emailArg.split('=')[1] : process.env.ADMIN_EMAIL;
  const adminPassword = passwordArg ? passwordArg.split('=')[1] : process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      'Ошибка: Необходимо указать email и пароль админа (аргументами --email/--password или через переменные окружения ADMIN_EMAIL/ADMIN_PASSWORD).',
    );
    process.exit(1);
  }

  console.log('--- Начало сидирования ---');

  try {
    const ADMIN_USER_ID = uuidByString(adminEmail);

    // 1. Создание ролей
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

    const teacherRole = await prisma.role.upsert({
      where: { role: 'TEACHER' },
      update: {},
      create: { role: 'TEACHER' },
    });

    // 2. Создание админа
    const adminUser = await prisma.user.upsert({
      where: { id: ADMIN_USER_ID },
      update: {
        email: adminEmail,
        password: bcrypt.hashSync(adminPassword, 10),
        roles: {
          connect: [{ id: adminRole.id }, { id: userRole.id }],
        },
      },
      create: {
        id: ADMIN_USER_ID,
        email: adminEmail,
        name: 'Админ ЛитКот',
        password: bcrypt.hashSync(adminPassword, 10),
        roles: {
          connect: [{ id: adminRole.id }, { id: userRole.id }],
        },
      },
    });

    console.log(`Админ создан: ${adminEmail}`);

    // Создание учителя
    const teacherEmail = 'teacher@leetcot.ru';
    const teacherPassword = 'teacherpass123';
    const TEACHER_USER_ID = uuidByString(teacherEmail);

    await prisma.user.upsert({
      where: { id: TEACHER_USER_ID },
      update: {
        email: teacherEmail,
        password: bcrypt.hashSync(teacherPassword, 10),
        roles: {
          connect: [{ id: teacherRole.id }, { id: userRole.id }],
        },
      },
      create: {
        id: TEACHER_USER_ID,
        email: teacherEmail,
        name: 'Учитель ЛитКот',
        password: bcrypt.hashSync(teacherPassword, 10),
        roles: {
          connect: [{ id: teacherRole.id }, { id: userRole.id }],
        },
      },
    });

    console.log(`Учитель создан: ${teacherEmail} с паролем: ${teacherPassword}`);

    // 3. Импорт задач
    const localChallenges = await ingestChallenges(challengePath);
    console.log(`Найдено задач: ${localChallenges.length}`);

    for (const challenge of localChallenges) {
      const { author: _, ...challengeData } = challenge;
      await prisma.challenge.upsert({
        where: { slug: challenge.slug },
        update: {
          ...challengeData,
          userId: adminUser.id,
        },
        create: {
          ...challengeData,
          userId: adminUser.id,
        },
      });
    }

    const createdTracksMap = new Map<string, unknown>();

    const trackChallengeSlugs: Record<string, string[]> = {
      'python-algo-fishing': [
        'python-fish-twosum',
        'python-fish-palindrome',
        'python-fish-binary-search',
        'python-fish-stack',
        'python-fish-sort',
        'python-fish-sliding-window',
        'python-fish-yarn',
        'python-fish-tree',
        'python-fish-heap',
        'python-fish-graph',
        'python-fish-dp',
        'python-fish-backtracking',
        'python-fish-dijkstra',
        'python-fish-merge-intervals',
        'python-fish-stock-trade',
        'python-fish-valid-anagram',
      ],
    };

    // 4. Создание треков
    for (const track of tracks) {
      const createdTrack = await prisma.track.upsert({
        where: { slug: track.slug || slugify(track.name) },
        update: {
          name: track.name,
          description: track.description,
          visible: true,
        },
        create: {
          name: track.name,
          slug: track.slug || slugify(track.name),
          description: track.description,
          visible: true,
        },
      });

      createdTracksMap.set(createdTrack.slug, createdTrack);

      const targetSlugs = trackChallengeSlugs[createdTrack.slug] || [];
      const dbChallenges = await prisma.challenge.findMany({
        where: {
          slug: {
            in: targetSlugs,
          },
        },
      });

      // Clear old connections for this track
      await prisma.trackChallenge.deleteMany({
        where: { trackId: createdTrack.id },
      });

      const orderedChallenges = dbChallenges.sort((a, b) => {
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

    // 5. Создание курсов
    for (const course of courses) {
      const createdCourse = await prisma.course.upsert({
        where: { slug: course.slug },
        update: {
          name: course.name,
          description: course.description,
          visible: true,
        },
        create: {
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
            where: { id: (dbTrack as { id: number }).id },
            data: { courseId: createdCourse.id },
          });
        }
      }
    }

    console.log('Сидирование успешно завершено.');
    await prisma.$disconnect();
  } catch (e) {
    console.error('Ошибка при сидировании:', e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
