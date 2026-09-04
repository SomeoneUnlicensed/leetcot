'use client';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { updateCandidateStage } from '../candidates/[id]/update-stage.action';
import { useToast } from '@repo/ui/components/use-toast';

type CandidateSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pipelineStage: string;
  createdAt: Date;
  _count: { interviews: number };
};

type Column = {
  stage: string;
  label: string;
  candidates: CandidateSummary[];
};

export function PipelineBoard({ columns }: { columns: Column[] }) {
  const [cols, setCols] = useState(columns);
  const { toast } = useToast();

  const handleDrop = useCallback(async (candidateId: string, newStage: string) => {
    setCols((prev) =>
      prev.map((col) => ({
        ...col,
        candidates:
          col.stage === newStage
            ? [...col.candidates, prev.flatMap((c) => c.candidates).find((c) => c.id === candidateId)!].filter(Boolean)
            : col.candidates.filter((c) => c.id !== candidateId),
      })),
    );

    const result = await updateCandidateStage(candidateId, newStage);
    if (!result.success) {
      toast({ title: 'Ошибка обновления этапа', variant: 'destructive' });
    }
  }, [toast]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {cols.map((column) => (
        <div
          key={column.stage}
          className="min-w-[280px] flex-1"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData('candidateId');
            if (id) handleDrop(id, column.stage);
          }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                {column.label}
                <Badge variant="secondary">{column.candidates.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('candidateId', candidate.id)}
                  className="cursor-grab rounded border bg-card p-3 text-sm shadow-sm active:cursor-grabbing"
                >
                  <div className="font-medium">
                    {candidate.firstName} {candidate.lastName}
                  </div>
                  <div className="text-muted-foreground text-xs">{candidate.email}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">{candidate._count.interviews} интервью</span>
                    <Link href={`/dashboard/hr/candidates/${candidate.id}`}>
                      <Button variant="ghost" size="sm">→</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {column.candidates.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-xs">Нет кандидатов</p>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
