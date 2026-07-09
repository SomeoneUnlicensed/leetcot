'use server';
import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { revalidatePath } from 'next/cache';

export async function saveNote(sessionId: string, content: string) {
  const session = await auth();
  assertAdminOrRecruiter(session);

  await prisma.interviewNote.create({
    data: {
      sessionId,
      authorId: session!.user.id,
      content,
    },
  });

  revalidatePath(`/dashboard/hr/interviews/${sessionId}`);
  return { success: true };
}
