import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import Link from 'next/link';
import { buttonVariants } from '@repo/ui/components/button';
import { cn } from '@repo/ui/cn';

export default async function HROverviewPage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const [candidates, interviews, challenges] = await Promise.all([
    prisma.candidate.count(),
    prisma.interviewSession.count(),
    prisma.challenge.count({ where: { status: 'ACTIVE' } }),
  ]);

  const pipelineCounts = await prisma.candidate.groupBy({
    by: ['pipelineStage'],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">HR Рекрутинг</h3>
        <p className="text-muted-foreground text-sm">Управление наймом и интервью</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{candidates}</div>
          <div className="text-muted-foreground text-sm">Кандидатов</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{interviews}</div>
          <div className="text-muted-foreground text-sm">Интервью</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{challenges}</div>
          <div className="text-muted-foreground text-sm">Задач в банке</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Воронка найма</h4>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {pipelineCounts.map((item) => (
            <div key={item.pipelineStage} className="rounded bg-muted p-3 text-center">
              <div className="text-lg font-bold">{item._count}</div>
              <div className="text-muted-foreground text-xs">{item.pipelineStage.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/hr/candidates" className={cn(buttonVariants({ variant: 'default' }))}>
          Кандидаты
        </Link>
        <Link href="/dashboard/hr/interviews/create" className={cn(buttonVariants({ variant: 'outline' }))}>
          Новое интервью
        </Link>
      </div>
    </div>
  );
}
