import { type Prisma } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const defaultExcludes = ['blank', 'solutions', 'aot'];

// Python's `tests` field holds raw source that's also rendered verbatim in the
// student's visible "Tests" editor pane (unlike SQL's JSON `tests`), so the oracle
// config can't just replace the field's shape without breaking that pane. Instead
// it's appended after this marker, which getChallengeRouteData strips before the
// value ever reaches the client — code-runner is the only reader of the full string.
export const PYTHON_ORACLE_MARKER = '# ---LEETCOT-ORACLE---';

function extractEntryPoint(solutionSource: string): string | null {
  const match = /^def\s+(\w+)\s*\(/m.exec(solutionSource);
  return match ? match[1] : null;
}

export async function ingestChallenges(
  challengePath: string,
  excludes = defaultExcludes,
  isRoot = true,
): Promise<(Prisma.ChallengeCreateManyInput & { author: string })[]> {
  const challengesToCreate: (Prisma.ChallengeCreateManyInput & { author: string })[] = [];

  try {
    const items = await fs.promises.readdir(challengePath);

    for (const item of items) {
      const itemPath = path.join(challengePath, item);

      // Skip items that are excluded.
      if (excludes.some((x) => itemPath.includes(x))) {
        continue;
      }

      const stats = await fs.promises.stat(itemPath);

      if (stats.isDirectory()) {
        if (isRoot) {
          // In root directory, treat each subdirectory as a potential challenge
          const challengeToCreate = await buildChallenge(itemPath, excludes);
          if (challengeToCreate?.slug) {
            challengesToCreate.push(challengeToCreate);
          }
        } else {
          // Recursively ingest challenges from deeper subdirectories if needed
          const nestedChallenges = await ingestChallenges(itemPath, excludes, false);
          challengesToCreate.push(...nestedChallenges);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  return challengesToCreate;
}

async function buildChallenge(
  pathToDirectory: string,
  excludes: string[],
): Promise<(Prisma.ChallengeCreateManyInput & { author: string }) | null> {
  const challengeToCreate: Prisma.ChallengeCreateManyInput & { author: string } = {
    status: 'ACTIVE',
  } as Prisma.ChallengeCreateManyInput & { author: string };

  // For SQL challenges with a random-data oracle (`generator.py` alongside
  // solution.sql), the reference solution and seed generator get folded into the
  // `tests` JSON below — they must never be readable from `code`/a separate column
  // the client could see, only from the server-only `tests` field.
  let solutionContent: string | undefined;
  let generatorContent: string | undefined;
  let oracleConfigContent: string | undefined;

  try {
    const files = await fs.promises.readdir(pathToDirectory);

    for (const file of files) {
      const itemPath = path.join(pathToDirectory, file);

      // Skip excluded files.
      if (excludes.some((x) => itemPath.includes(x))) {
        continue;
      }

      const stats = await fs.promises.stat(itemPath);

      if (stats.isFile()) {
        const fileName = path.parse(itemPath).name;

        try {
          const fileContents = await fs.promises.readFile(itemPath, 'utf8');
          if (fileName === 'prompt') {
            let cleaned = fileContents
              .replace(/> 🏢 \*\*Эта задача часто встречается на собеседованиях в:\*\*.*$/gm, '')
              .replace(/> 😺 \*\*ЛитКот напоминает:\*\*.*$/gm, '')
              .replace(/>\s*$/gm, '');
            cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
            challengeToCreate.description = cleaned;
          }
          if (fileName === 'user') {
            challengeToCreate.code = fileContents;
          }
          if (fileName === 'solution') {
            challengeToCreate.code = fileContents;
            solutionContent = fileContents;
          }
          if (fileName === 'generator') {
            generatorContent = fileContents;
          }
          if (fileName === 'oracle-config') {
            oracleConfigContent = fileContents;
          }
          if (fileName === 'tests') {
            challengeToCreate.tests = fileContents;
          }
          if (fileName === 'metadata') {
            const jsonData = JSON.parse(fileContents);
            challengeToCreate.difficulty = jsonData.difficulty.toUpperCase();
            challengeToCreate.name = jsonData.label;
            challengeToCreate.slug = jsonData.id;
            challengeToCreate.shortDescription = jsonData.description;
            challengeToCreate.author = jsonData.author;
            if (jsonData.language) {
              challengeToCreate.language = jsonData.language.toUpperCase();
            }
            if (jsonData.isInfoOnly !== undefined) {
              challengeToCreate.isInfoOnly = Boolean(jsonData.isInfoOnly);
            }
          }
          if (fileName === 'tsconfig') {
            const jsonData = JSON.parse(fileContents);
            if (jsonData.compilerOptions != null) {
              challengeToCreate.tsconfig = jsonData.compilerOptions;
            }
          }
        } catch (jsonError) {
          console.error(`Error reading or parsing ${fileName}:`, jsonError);
        }
      }
    }

    if (generatorContent && solutionContent && challengeToCreate.language === 'SQL' && challengeToCreate.tests) {
      try {
        const testsWithOracle = JSON.parse(challengeToCreate.tests);
        testsWithOracle.referenceSolution = solutionContent;
        testsWithOracle.seedGenerator = generatorContent;
        challengeToCreate.tests = JSON.stringify(testsWithOracle);
      } catch (oracleError) {
        console.error(`Error folding generator.py into tests for ${pathToDirectory}:`, oracleError);
      }
    }

    if (generatorContent && solutionContent && challengeToCreate.language === 'PYTHON') {
      const entryPoint = extractEntryPoint(solutionContent);
      if (entryPoint) {
        const extraConfig = oracleConfigContent ? JSON.parse(oracleConfigContent) : {};
        const oracleBlock = JSON.stringify({
          entryPoint,
          referenceSolution: solutionContent,
          seedGenerator: generatorContent,
          ...extraConfig,
        });
        const visibleTests = challengeToCreate.tests ?? '';
        challengeToCreate.tests = `${visibleTests}\n\n${PYTHON_ORACLE_MARKER}\n# ${oracleBlock}\n`;
      } else {
        console.error(`generator.py present but no top-level "def" found in solution.py for ${pathToDirectory}`);
      }
    }

    if (!challengeToCreate.code) {
      challengeToCreate.code = '// Решение пишется здесь';
    }
    if (!challengeToCreate.tests) {
      challengeToCreate.tests = '// Тесты для этой задачи отсутствуют';
    }

    return challengeToCreate;
  } catch (error) {
    console.error('Error reading directory:', error);
    return null;
  }
}
