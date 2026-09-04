'use server';
import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  cvLink: z.string().optional(),
  notes: z.string().optional(),
});

export async function createCandidate(data: z.infer<typeof schema>) {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const parsed = schema.parse(data);

  await prisma.candidate.create({
    data: {
      ...parsed,
      createdById: session!.user.id,
    },
  });

  revalidatePath('/dashboard/hr/candidates');
  return { success: true };
}
