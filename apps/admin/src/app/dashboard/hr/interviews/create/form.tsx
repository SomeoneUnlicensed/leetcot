'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { useToast } from '@repo/ui/components/use-toast';
import { createInterview } from './create-interview.action';

type Candidate = { id: string; firstName: string; lastName: string; email: string };
type Challenge = { id: number; name: string; slug: string; difficulty: string };

export function CreateInterviewForm({
  candidates,
  challenges,
  recruiterId,
}: {
  candidates: Candidate[];
  challenges: Challenge[];
  recruiterId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('3600');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || selectedChallenges.length === 0) {
      toast({ title: 'Выберите кандидата и хотя бы одну задачу', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      const result = await createInterview({
        title,
        candidateId: selectedCandidate,
        recruiterId,
        challengeIds: selectedChallenges,
        duration: parseInt(duration, 10),
      });

      if (result.success) {
        toast({ title: 'Интервью создано!' });
        router.push(`/dashboard/hr/interviews/${result.id}`);
      } else {
        toast({ title: 'Ошибка создания', variant: 'destructive' });
      }
    });
  };

  const toggleChallenge = (id: number) => {
    setSelectedChallenges((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Название интервью</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Backend-разработчик" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Длительность (сек)</Label>
          <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Кандидат</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {candidates.map((c) => (
            <Card
              key={c.id}
              className={`cursor-pointer ${selectedCandidate === c.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCandidate(c.id)}
            >
              <CardContent className="p-3">
                <div className="font-medium">{c.firstName} {c.lastName}</div>
                <div className="text-muted-foreground text-xs">{c.email}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Задачи ({selectedChallenges.length} выбрано)</Label>
        <div className="grid gap-2 md:grid-cols-3">
          {challenges.map((ch) => {
            const selected = selectedChallenges.includes(ch.id);
            return (
              <Card
                key={ch.id}
                className={`cursor-pointer ${selected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => toggleChallenge(ch.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">{ch.name}</div>
                    {selected && <Badge>✓</Badge>}
                  </div>
                  <Badge variant="outline" className="mt-1">{ch.difficulty}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Создание...' : 'Создать интервью'}
      </Button>
    </form>
  );
}
