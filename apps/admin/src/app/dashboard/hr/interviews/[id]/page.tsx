import { auth } from '~/server/auth';
import { prisma } from '@repo/db';
import { assertAdminOrRecruiter } from '~/utils/auth-guards';
import { notFound } from 'next/navigation';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { cn } from '@repo/ui/cn';
import { buttonVariants } from '@repo/ui/components/button';

export default async function InterviewDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  assertAdminOrRecruiter(session);

  const interview = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      candidate: true,
      recruiter: { select: { name: true } },
      challenges: {
        include: { challenge: { select: { name: true, slug: true, difficulty: true } } },
        orderBy: { order: 'asc' },
      },
      notes: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!interview) notFound();

  const interviewLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${interview.token}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{interview.title}</h3>
          <p className="text-muted-foreground text-sm">
            {interview.candidate.firstName} {interview.candidate.lastName} · {interview.recruiter.name}
          </p>
        </div>
        <Badge>{interview.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Ссылка для кандидата</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted p-2 text-sm">{interviewLink}</code>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(interviewLink)}>
              Копировать
            </Button>
          </div>
        </div>

        {interview.status === 'IN_PROGRESS' && (
          <div className="rounded-lg border p-4">
            <h4 className="mb-2 font-medium">Live-просмотр</h4>
            <Link href={`/dashboard/hr/interviews/${interview.id}/live`}>
              <Button>Наблюдать</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Задачи ({interview.challenges.length})</h4>
        <div className="space-y-2">
          {interview.challenges.map((ic) => (
            <div key={ic.id} className="flex items-center justify-between rounded bg-muted p-3">
              <div>
                <div className="font-medium">{ic.challenge.name}</div>
                <Badge variant="outline">{ic.challenge.difficulty}</Badge>
              </div>
              <div className="text-sm">
                {ic.isSubmitted
                  ? `${ic.passedTests}/${ic.totalTests} тестов`
                  : 'Не решена'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Заметки ({interview.notes.length})</h4>
        {interview.notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Нет заметок</p>
        ) : (
          <div className="space-y-2">
            {interview.notes.map((note) => (
              <div key={note.id} className="rounded bg-muted p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{note.author.name}</span>
                  <span className="text-muted-foreground text-xs">{note.createdAt.toLocaleString()}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
                {note.rating && <Badge variant="secondary">Оценка: {note.rating}/5</Badge>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
