import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { CreateInterviewForm } from './form';

export default async function CreateInterviewPage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const [candidates, challenges] = await Promise.all([
    prisma.candidate.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, slug: true, difficulty: true },
      orderBy: { id: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Создать интервью</h3>
        <p className="text-muted-foreground text-sm">Выберите кандидата и задачи</p>
      </div>
      <CreateInterviewForm candidates={candidates} challenges={challenges} recruiterId={session!.user.id} />
    </div>
  );
}
