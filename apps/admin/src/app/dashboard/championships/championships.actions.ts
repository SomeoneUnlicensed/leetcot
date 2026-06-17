'use server';

import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import type { Challenge } from '@repo/db/types';
import { assertAdmin } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

export async function getChampionships() {
  const session = await auth();
  assertAdmin(session);

  return prisma.championship.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      company: true,
      _count: {
        select: {
          participants: true,
          challenges: true,
        },
      },
    },
  });
}

export async function createChampionship(data: {
  name: string;
  slug: string;
  description: string;
  status?: string;
  startDate: Date;
  endDate: Date;
  companyId?: string | null;
}) {
  const session = await auth();
  assertAdmin(session);

  const existing = await prisma.championship.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error('Чемпионат с таким slug уже существует');
  }

  const championship = await prisma.championship.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status || 'DRAFT',
      startDate: data.startDate,
      endDate: data.endDate,
      companyId: data.companyId || null,
    },
  });

  revalidatePath('/dashboard/championships');
  return championship;
}

export async function updateChampionship(
  id: string,
  data: {
    name: string;
    slug: string;
    description: string;
    status: string;
    startDate: Date;
    endDate: Date;
    companyId?: string | null;
  },
) {
  const session = await auth();
  assertAdmin(session);

  const updated = await prisma.championship.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      companyId: data.companyId || null,
    },
  });

  revalidatePath('/dashboard/championships');
  return updated;
}

export async function deleteChampionship(id: string) {
  const session = await auth();
  assertAdmin(session);

  // Clean relations
  await prisma.championshipChallenge.deleteMany({
    where: { championshipId: id },
  });

  await prisma.championshipParticipant.deleteMany({
    where: { championshipId: id },
  });

  await prisma.championship.delete({
    where: { id },
  });

  revalidatePath('/dashboard/championships');
}

export async function getChampionshipChallenges(championshipId: string): Promise<Challenge[]> {
  const session = await auth();
  assertAdmin(session);

  const links = await prisma.championshipChallenge.findMany({
    where: { championshipId },
    include: {
      challenge: true,
    },
  });

  return links.map((l) => l.challenge);
}

export async function getAvailableChallenges() {
  const session = await auth();
  assertAdmin(session);

  return prisma.challenge.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      difficulty: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function addChallengeToChampionship(championshipId: string, challengeId: number) {
  const session = await auth();
  assertAdmin(session);

  const link = await prisma.championshipChallenge.create({
    data: {
      championshipId,
      challengeId,
    },
  });

  revalidatePath('/dashboard/championships');
  return link;
}

export async function removeChallengeFromChampionship(championshipId: string, challengeId: number) {
  const session = await auth();
  assertAdmin(session);

  await prisma.championshipChallenge.delete({
    where: {
      championshipId_challengeId: {
        championshipId,
        challengeId,
      },
    },
  });

  revalidatePath('/dashboard/championships');
}

export async function getChampionshipParticipants(championshipId: string) {
  const session = await auth();
  assertAdmin(session);

  return prisma.championshipParticipant.findMany({
    where: { championshipId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { score: 'desc' },
  });
}
