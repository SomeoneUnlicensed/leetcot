import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LENTA_CHAMPIONSHIP_SLUG, hashFlag, prisma } from '../src';
import { debugTasks } from './data/debug-tasks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plaintext flags never live in the DB or in git — only their sha256 hash does.
// An organizer-supplied flag map (slug -> flag) can be passed via DEBUG_TASK_FLAGS
// as JSON. Anything left unset gets a freshly generated random flag, written out to
// a local (gitignored) file so it can be handed to infra / put on the target boxes.
const LOCAL_FLAGS_FILE = path.join(__dirname, '.debug-flags.local.json');

function loadProvidedFlags(): Record<string, string> {
  if (process.env.DEBUG_TASK_FLAGS) {
    try {
      return JSON.parse(process.env.DEBUG_TASK_FLAGS) as Record<string, string>;
    } catch {
      console.warn('DEBUG_TASK_FLAGS is not valid JSON, ignoring it.');
    }
  }

  if (fs.existsSync(LOCAL_FLAGS_FILE)) {
    return JSON.parse(fs.readFileSync(LOCAL_FLAGS_FILE, 'utf8')) as Record<string, string>;
  }

  return {};
}

function generateFlag(slug: string) {
  return `LENTA{${slug.replace(/-/g, '_')}_${randomBytes(4).toString('hex')}}`;
}

async function main() {
  const championship = await prisma.championship.upsert({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
    update: {},
    create: {
      slug: LENTA_CHAMPIONSHIP_SLUG,
      name: 'Лента: Дебаг-Симулятор',
      description:
        'Дебаг-симулятор для мероприятия Ленты: набор задач на выданном сервере — от подбора SSH-пароля до восстановления упавшего узла кластера.',
      status: 'DRAFT',
      // Placeholder dates — update once infra confirms the event window.
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  const providedFlags = loadProvidedFlags();
  const resolvedFlags: Record<string, string> = { ...providedFlags };

  for (const task of debugTasks) {
    const flag = resolvedFlags[task.slug] ?? generateFlag(task.slug);
    resolvedFlags[task.slug] = flag;

    await prisma.debugTask.upsert({
      where: { slug: task.slug },
      update: {
        championshipId: championship.id,
        title: task.title,
        category: task.category,
        instructions: task.instructions,
        difficulty: task.difficulty,
        points: task.points,
        sortOrder: task.sortOrder,
        flagHash: hashFlag(flag),
      },
      create: {
        championshipId: championship.id,
        slug: task.slug,
        title: task.title,
        category: task.category,
        instructions: task.instructions,
        difficulty: task.difficulty,
        points: task.points,
        sortOrder: task.sortOrder,
        flagHash: hashFlag(flag),
      },
    });
  }

  fs.writeFileSync(LOCAL_FLAGS_FILE, `${JSON.stringify(resolvedFlags, null, 2)}\n`);

  console.log(`Championship: ${championship.name} (${championship.slug}), status=${championship.status}`);
  console.log(`Seeded ${debugTasks.length} debug tasks.`);
  console.log(`Plaintext flags written to ${LOCAL_FLAGS_FILE} (gitignored, hand off to infra).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
