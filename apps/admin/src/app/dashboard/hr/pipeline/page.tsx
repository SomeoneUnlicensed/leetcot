import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { PipelineBoard } from './pipeline-board';

const stageOrder = ['SCREENING', 'TECH_INTERVIEW', 'SYSTEM_DESIGN', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED'] as const;

const stageLabels: Record<string, string> = {
  SCREENING: 'Скрининг',
  TECH_INTERVIEW: 'Тех. интервью',
  SYSTEM_DESIGN: 'System Design',
  FINAL_INTERVIEW: 'Финальное',
  OFFER: 'Оффер',
  REJECTED: 'Отказ',
};

export default async function PipelinePage() {
  const session = await auth();
  assertAdminOrRecruiter(session);

  const candidates = await prisma.candidate.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      pipelineStage: true,
      createdAt: true,
      _count: { select: { interviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const columns = stageOrder.map((stage) => ({
    stage,
    label: stageLabels[stage],
    candidates: candidates.filter((c) => c.pipelineStage === stage),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Воронка найма</h3>
        <p className="text-muted-foreground text-sm">Перетаскивайте кандидатов между этапами</p>
      </div>
      <PipelineBoard columns={columns} />
    </div>
  );
}
