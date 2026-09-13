import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/server/auth';
import { isAdmin } from '~/utils/auth-guards';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  return NextResponse.json({ activeRegistrationBlock: championship?.activeRegistrationBlock ?? null });
}

const SetActiveBlockSchema = z.object({
  activeRegistrationBlock: z.enum(['BLOCK_1', 'BLOCK_2']).nullable(),
});

export async function PATCH(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Только для администраторов.' }, { status: 403 });
  }

  const parsed = SetActiveBlockSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Некорректные данные.' }, { status: 400 });
  }

  const championship = await prisma.championship.update({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
    data: { activeRegistrationBlock: parsed.data.activeRegistrationBlock },
  });

  return NextResponse.json({ activeRegistrationBlock: championship.activeRegistrationBlock });
}
