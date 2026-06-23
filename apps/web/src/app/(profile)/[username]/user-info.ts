import { prisma } from '@repo/db';
import type { Difficulty as DifficultyWithEvent } from '@repo/db/types';
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getDay,
  getMonth,
  getWeek,
  isSameDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import { getBadgeDefinition } from '~/lib/badge-definitions';

type Difficulty = Exclude<DifficultyWithEvent, 'EVENT'>;

export async function getProgressData(userId: string) {
  // Get all successful submissions for the user
  const successfulSubmissions = await prisma.submission.findMany({
    where: {
      userId,
      isSuccessful: true,
      challenge: {
        NOT: {
          difficulty: 'EVENT',
        },
      },
    },
    select: {
      challenge: {
        select: {
          id: true,
        },
      },
    },
    distinct: ['challengeId'],
  });

  // Get all challenges solved and group by difficulty
  const challengesSolved = await prisma.challenge.groupBy({
    by: ['difficulty'],
    where: {
      id: {
        // if the user has solved challenge, it will be in the successfulSubmissions array
        in: successfulSubmissions.map((challenge) => challenge.challenge.id),
      },
    },
    _count: {
      _all: true,
    },
  });

  const allChallenges = await prisma.challenge.groupBy({
    where: {
      NOT: {
        difficulty: 'EVENT',
      },
    },
    by: ['difficulty'],
    _count: {
      _all: true,
    },
  });

  // Calculate percentage, total solved and total challenges
  const totalSolved = challengesSolved.reduce(
    (acc, challenge) => Number(acc) + Number(challenge._count._all),
    0,
  );
  const totalChallenges = allChallenges.reduce(
    (acc, challenge) => Number(acc) + Number(challenge._count._all),
    0,
  );

  const chartData: {
    difficulty: Difficulty;
    completedPercentage: number;
    completed: number;
    fill: string;
    total: number;
  }[] = [];

  // assign values to the challenges object
  allChallenges.forEach((challenge) => {
    const solved =
      challengesSolved.find((solvedC) => solvedC.difficulty === challenge.difficulty)?._count
        ._all ?? 0;

    chartData.push({
      difficulty: challenge.difficulty as Difficulty,
      completed: solved,
      completedPercentage: Math.round((solved / challenge._count._all) * 100),
      fill: `var(--color-${challenge.difficulty})`,
      total: challenge._count._all,
    });
  });
  const difficultyOrder = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'EXTREME'] as const;
  chartData.sort(
    (a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty),
  );
  return {
    chartData,
    totalSolved,
    totalChallenges,
  };
}

export async function getUserActivity(userId: string) {
  const endDate = new Date();
  const startDate = startOfWeek(subDays(endDate, 60), { weekStartsOn: 0 });

  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    select: {
      submission: {
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      comment: {
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      },
    },
  });
  const days = eachDayOfInterval({ start: startDate, end: endDate }).map((date) => {
    const comments = user.comment.filter((c) => isSameDay(c.createdAt, date)).length;
    const badges = 0;
    const submissions = user.submission.filter((s) => isSameDay(s.createdAt, date)).length;
    const activity = Number(comments) + Number(badges) + Number(submissions);
    return {
      date,
      day: getDay(date),
      week: getWeek(date),
      month: getMonth(date),
      submissions,
      comments,
      badges,
      activity,
    };
  });

  return days;
}

export async function getUserStreak(userId: string) {
  const submissions = await prisma.submission.findMany({
    where: { userId, isSuccessful: true },
    select: { createdAt: true },
  });

  const solvedDays = new Set(submissions.map((s) => format(s.createdAt, 'yyyy-MM-dd')));

  let cursor = new Date();
  if (!solvedDays.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
  }
  let currentStreak = 0;
  while (solvedDays.has(format(cursor, 'yyyy-MM-dd'))) {
    currentStreak++;
    cursor = subDays(cursor, 1);
  }

  const sortedDays = [...solvedDays].sort();
  let longestStreak = 0;
  let run = 0;
  sortedDays.forEach((day, i) => {
    if (i === 0) {
      run = 1;
    } else {
      const diff = differenceInCalendarDays(new Date(day), new Date(sortedDays[i - 1]!));
      run = diff === 1 ? run + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, run);
  });

  return { currentStreak, longestStreak };
}

export interface BadgeInfo {
  slug: string;
  name: string;
}

export async function getBadges(userId: string): Promise<BadgeInfo[]> {
  const dbBadges = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { awardedAt: 'asc' },
    select: { badgeSlug: true },
  });

  const registered: BadgeInfo = {
    slug: 'registered',
    name: 'Участник ЛитКот (За регистрацию)',
  };

  const awarded: BadgeInfo[] = dbBadges.map((b) => ({
    slug: b.badgeSlug,
    name: getBadgeDefinition(b.badgeSlug)?.name ?? b.badgeSlug,
  }));

  return [registered, ...awarded];
}
