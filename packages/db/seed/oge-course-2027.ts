import { prisma } from '../src';
import { ogeModules2027 } from './data/oge-informatika-2027';

const OGE_COURSE_SLUG = 'oge-informatika-2027';
const TRACK_SLUGS = [
  'oge-2027-digital-lit',
  'oge-2027-theory',
  'oge-2027-algo-prog',
  'oge-2027-it',
];

async function main() {
  console.log('Seeding OGE Informatics 2027 course...');

  const course = await prisma.course.findFirst({
    where: { slug: OGE_COURSE_SLUG },
  });

  if (!course) {
    throw new Error(`OGE 2027 course not found: ${OGE_COURSE_SLUG}. Run content seed first.`);
  }

  console.log(`Found course: ${course.name} (id: ${course.id})`);

  for (const moduleData of ogeModules2027) {
    const track = await prisma.track.findFirst({
      where: { slug: moduleData.trackSlug },
    });

    if (!track) {
      console.warn(`Track not found: ${moduleData.trackSlug}. Skipping.`);
      continue;
    }

    if (track.courseId !== course.id) {
      await prisma.track.update({
        where: { id: track.id },
        data: { courseId: course.id },
      });
    }

    console.log(`  Seeding ${moduleData.lessons.length} lessons for ${track.slug}...`);
    for (const lesson of moduleData.lessons) {
      await prisma.ogeLesson.upsert({
        where: {
          trackId_slug: {
            trackId: track.id,
            slug: lesson.slug,
          },
        },
        update: {
          order: lesson.order,
          title: lesson.title,
          content: lesson.content,
          duration: lesson.duration,
        },
        create: {
          trackId: track.id,
          order: lesson.order,
          title: lesson.title,
          slug: lesson.slug,
          content: lesson.content,
          duration: lesson.duration,
        },
      });
    }

    console.log(`  Seeding ${moduleData.tasks.length} tasks for ${track.slug}...`);
    for (const task of moduleData.tasks) {
      await prisma.ogeTask.upsert({
        where: {
          trackId_order: {
            trackId: track.id,
            order: task.order,
          },
        },
        update: {
          examQuestionNumber: task.examQuestionNumber,
          difficulty: task.difficulty,
          prompt: task.prompt,
          taskData: task.taskData ?? undefined,
          correctAnswer: task.correctAnswer,
          solution: task.solution,
          type: task.type,
          status: 'ACTIVE',
        },
        create: {
          trackId: track.id,
          order: task.order,
          examQuestionNumber: task.examQuestionNumber,
          difficulty: task.difficulty,
          prompt: task.prompt,
          taskData: task.taskData ?? undefined,
          correctAnswer: task.correctAnswer,
          solution: task.solution,
          type: task.type,
          status: 'ACTIVE',
        },
      });
    }
  }

  for (const trackSlug of TRACK_SLUGS) {
    const track = await prisma.track.findFirst({
      where: { slug: trackSlug },
    });

    if (!track) continue;

    const lessonCount = await prisma.ogeLesson.count({
      where: { trackId: track.id },
    });

    const taskCount = await prisma.ogeTask.count({
      where: { trackId: track.id },
    });

    console.log(`  Track ${track.slug}: ${lessonCount} lessons, ${taskCount} tasks`);
  }

  console.log('OGE 2027 course seed completed!');
}

main()
  .catch((error) => {
    console.error('OGE 2027 seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
