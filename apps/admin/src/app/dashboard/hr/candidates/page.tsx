import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { DataTable } from '@repo/ui/components/data-table';
import { columns } from './columns';

export default async function CandidatesPage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const candidates = await prisma.candidate.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { interviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Кандидаты</h3>
          <p className="text-muted-foreground text-sm">Все кандидаты в системе</p>
        </div>
      </div>
      <DataTable data={candidates} columns={columns} />
    </div>
  );
}
