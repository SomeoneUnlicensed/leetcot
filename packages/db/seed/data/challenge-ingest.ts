import { type Prisma } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const defaultExcludes = ['blank', 'solutions', 'aot'];

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

  try {
    const files = await fs.promises.readdir(pathToDirectory);
    console.log(files);

    for (const file of files) {
      const itemPath = path.join(pathToDirectory, file);
      console.log('buildChallenge Processing:', itemPath);

      // Skip excluded files.
      if (excludes.some((x) => itemPath.includes(x))) {
        console.log('Skipping:', itemPath);
        continue;
      }

      const stats = await fs.promises.stat(itemPath);

      if (stats.isFile()) {
        const fileName = path.parse(itemPath).name;

        try {
          const fileContents = await fs.promises.readFile(itemPath, 'utf8');
          if (fileName === 'prompt') {
            challengeToCreate.description = fileContents;
          }
          if (fileName === 'user') {
            challengeToCreate.code = fileContents;
          }
          if (fileName === 'solution') {
            challengeToCreate.code = fileContents;
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
