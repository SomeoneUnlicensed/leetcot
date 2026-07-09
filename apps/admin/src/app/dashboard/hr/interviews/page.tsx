import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { DataTable } from '@repo/ui/components/data-table';
import { columns } from './columns';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { cn } from '@repo/ui/cn';
import { buttonVariants } from '@repo/ui/components/button';

export default async function InterviewsPage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const interviews = await prisma.interviewSession.findMany({
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      recruiter: { select: { name: true } },
      _count: { select: { challenges: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Интервью</h3>
          <p className="text-muted-foreground text-sm">Все сессии интервью</p>
        </div>
        <Link href="/dashboard/hr/interviews/create" className={cn(buttonVariants({ variant: 'default' }))}>
          Создать интервью
        </Link>
      </div>
      <DataTable data={interviews} columns={columns} />
    </div>
  );
}
