'use server';
import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import crypto from 'node:crypto';

const schema = z.object({
  title: z.string().min(1),
  candidateId: z.string().min(1),
  recruiterId: z.string().min(1),
  challengeIds: z.array(z.number()).min(1),
  duration: z.number().min(60).max(86400),
});

export async function createInterview(data: z.infer<typeof schema>) {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const parsed = schema.parse(data);
  const token = crypto.randomBytes(16).toString('hex');

  const interview = await prisma.interviewSession.create({
    data: {
      title: parsed.title,
      token,
      duration: parsed.duration,
      candidateId: parsed.candidateId,
      recruiterId: parsed.recruiterId,
      status: 'PENDING',
      challenges: {
        create: parsed.challengeIds.map((challengeId, index) => ({
          challengeId,
          order: index,
          code: '',
        })),
      },
    },
  });

  revalidatePath('/dashboard/hr/interviews');
  return { success: true, id: interview.id, token };
}
