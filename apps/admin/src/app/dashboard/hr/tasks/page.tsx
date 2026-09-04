import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { DataTable } from '@repo/ui/components/data-table';
import { columns } from './columns';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export default async function TasksPage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const challenges = await prisma.challenge.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      difficulty: true,
      language: true,
      shortDescription: true,
    },
    orderBy: { id: 'asc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Банк задач</h3>
          <p className="text-muted-foreground text-sm">Выберите задачи для интервью</p>
        </div>
        <Link href="https://github.com/SomeoneUnlicensed/leetcot-contrib/blob/main/challenges/challenge-guidelines.md" target="_blank">
          <Button variant="outline">Добавить задачу</Button>
        </Link>
      </div>
      <DataTable data={challenges} columns={columns} />
    </div>
  );
}
