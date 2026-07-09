'use client';
import { useTransition } from 'react';
import { Button } from '@repo/ui/components/button';
import { updateCandidateStage } from './update-stage.action';
import { useToast } from '@repo/ui/components/use-toast';

const stages = ['SCREENING', 'TECH_INTERVIEW', 'SYSTEM_DESIGN', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED'] as const;

export function CandidateActions({ candidateId, currentStage }: { candidateId: string; currentStage: string }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStageChange = (stage: string) => {
    startTransition(async () => {
      const result = await updateCandidateStage(candidateId, stage);
      if (result.success) {
        toast({ title: 'Этап обновлён' });
      } else {
        toast({ title: 'Ошибка', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-2">
      {stages.map((stage) => (
        <Button
          key={stage}
          variant={currentStage === stage ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start"
          disabled={pending}
          onClick={() => handleStageChange(stage)}
        >
          {stage.replace(/_/g, ' ')}
        </Button>
      ))}
    </div>
  );
}
