import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { notFound } from 'next/navigation';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { CandidateActions } from './actions';

const stageColors: Record<string, string> = {
  SCREENING: 'bg-blue-100 text-blue-800',
  TECH_INTERVIEW: 'bg-yellow-100 text-yellow-800',
  SYSTEM_DESIGN: 'bg-purple-100 text-purple-800',
  FINAL_INTERVIEW: 'bg-orange-100 text-orange-800',
  OFFER: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default async function CandidateDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  assertAdminOrRecruiter(session);

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      interviews: {
        include: {
          recruiter: { select: { name: true } },
          _count: { select: { challenges: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!candidate) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {candidate.firstName} {candidate.lastName}
          </h3>
          <p className="text-muted-foreground text-sm">{candidate.email}</p>
        </div>
        <Badge className={stageColors[candidate.pipelineStage] || ''}>
          {candidate.pipelineStage.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Информация</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Телефон</dt>
              <dd>{candidate.phone || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">CV</dt>
              <dd>{candidate.cvLink ? <a href={candidate.cvLink} className="text-blue-500 underline" target="_blank">Ссылка</a> : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Создан</dt>
              <dd>{candidate.createdAt.toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Создал</dt>
              <dd>{candidate.createdBy.name}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Действия</h4>
          <CandidateActions candidateId={candidate.id} currentStage={candidate.pipelineStage} />
        </div>
      </div>

      {candidate.notes && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Заметки</h4>
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{candidate.notes}</p>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Интервью ({candidate.interviews.length})</h4>
        {candidate.interviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">Нет интервью</p>
        ) : (
          <div className="space-y-2">
            {candidate.interviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between rounded bg-muted p-3">
                <div>
                  <div className="font-medium">{interview.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {interview.recruiter.name} · {interview._count.challenges} задач · {interview.status}
                  </div>
                </div>
                <Link href={`/dashboard/hr/interviews/${interview.id}`}>
                  <Button variant="outline" size="sm">Открыть</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
