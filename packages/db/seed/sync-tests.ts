/**
 * sync-tests.ts
 *
 * Синхронизирует поле `tests` в БД из файлов задач: tests.py|tests.ts|tests.json.
 * без пересоздания задач. Запускать после изменения тестовых файлов.
 *
 * Использование:
 *   pnpm --filter @repo/db db:sync-tests
 *
 * Или напрямую:
 *   dotenv -e ../../.env tsx ./seed/sync-tests.ts
 */
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHALLENGES_PATH = path.join(__dirname, '../../../challenges');

const prisma = new PrismaClient();

const TEST_FILE_NAMES = ['tests.py', 'tests.go', 'tests.ts', 'tests.js', 'tests.json'];
const PYTHON_ORACLE_MARKER = '# ---LEETCOT-ORACLE---';

function extractEntryPoint(solutionSource: string): string | null {
  const match = /^(?:def|class)\s+(\w+)\s*(?:\(|:)/m.exec(solutionSource);
  return match?.[1] ?? null;
}

async function readOptionalFile(filePath: string): Promise<string | null> {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function readTestsFile(challengeDir: string): Promise<string | null> {
  for (const fileName of TEST_FILE_NAMES) {
    const filePath = path.join(challengeDir, fileName);
    try {
      await fs.promises.access(filePath);
      const testsContent = await fs.promises.readFile(filePath, 'utf8');

      if (fileName === 'tests.py') {
        const solutionContent = await readOptionalFile(path.join(challengeDir, 'solution.py'));
        const generatorContent = await readOptionalFile(path.join(challengeDir, 'generator.py'));
        const oracleConfigContent = await readOptionalFile(path.join(challengeDir, 'oracle-config.json'));
        const visibleTests = (testsContent.split(PYTHON_ORACLE_MARKER)[0] ?? '').trimEnd();

        if (solutionContent && generatorContent) {
          const entryPoint = extractEntryPoint(solutionContent);
          if (entryPoint) {
            const oracleBlock = JSON.stringify({
              entryPoint,
              referenceSolution: solutionContent,
              seedGenerator: generatorContent,
              ...(oracleConfigContent ? JSON.parse(oracleConfigContent) : {}),
            });
            return `${visibleTests}\n\n${PYTHON_ORACLE_MARKER}\n# ${oracleBlock}\n`;
          }
        }
      }

      return testsContent;
    } catch {
      // файл не найден — пробуем следующий
    }
  }
  return null;
}

async function readSlug(challengeDir: string): Promise<string | null> {
  const metaPath = path.join(challengeDir, 'metadata.json');
  try {
    const raw = await fs.promises.readFile(metaPath, 'utf8');
    const json = JSON.parse(raw) as { id?: string };
    return json.id ?? null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🔄 Синхронизация тестов из файлов в БД...');
  console.log(`📁 Папка задач: ${CHALLENGES_PATH}`);

  const dirs = await fs.promises.readdir(CHALLENGES_PATH);
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const dir of dirs) {
    const dirPath = path.join(CHALLENGES_PATH, dir);
    const stat = await fs.promises.stat(dirPath);
    if (!stat.isDirectory()) continue;

    const slug = await readSlug(dirPath);
    if (!slug) {
      console.log(`  ⚠️  Нет metadata.json в ${dir}, пропускаем`);
      skipped++;
      continue;
    }

    const testsContent = await readTestsFile(dirPath);
    if (!testsContent) {
      console.log(`  ⏭️  Нет файла тестов в ${dir}, пропускаем`);
      skipped++;
      continue;
    }

    const existing = await prisma.challenge.findUnique({ where: { slug } });
    if (!existing) {
      console.log(`  ❌ Задача с slug="${slug}" не найдена в БД`);
      notFound++;
      continue;
    }

    if (existing.tests === testsContent) {
      console.log(`  ✅ ${slug} — тесты не изменились`);
      skipped++;
      continue;
    }

    await prisma.challenge.update({
      where: { slug },
      data: { tests: testsContent },
    });

    console.log(`  📝 ${slug} — тесты обновлены`);
    updated++;
  }

  console.log('');
  console.log(`✨ Готово! Обновлено: ${updated}, пропущено: ${skipped}, не найдено в БД: ${notFound}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Ошибка:', e);
  await prisma.$disconnect();
  process.exit(1);
});
