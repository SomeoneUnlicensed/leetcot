'use server';
import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

export async function updateCandidateStage(candidateId: string, stage: string) {
  const session = await auth();
  assertAdminOrRecruiter(session);

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { pipelineStage: stage as any },
  });

  revalidatePath('/dashboard/hr');
  return { success: true };
}
