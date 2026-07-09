'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { saveNote } from './save-note.action';
import { useToast } from '@repo/ui/components/use-toast';

type ChallengeData = {
  id: string;
  challengeId: number;
  order: number;
  code: string;
  isSubmitted: boolean;
  passedTests: number;
  totalTests: number;
  challenge: { name: string; slug: string; difficulty: string; tests: string };
};

type Interview = {
  id: string;
  title: string;
  token: string;
  status: string;
  duration: number;
  candidate: { firstName: string; lastName: string };
  challenges: ChallengeData[];
};

export function LiveCodingView({ interview }: { interview: Interview }) {
  const { toast } = useToast();
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const challenge = interview.challenges[activeChallengeIdx];

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/interview/poll?id=${interview.id}`);
        const data = await res.json();

        if (data.code) setCode(data.code);
        if (data.events) setEvents(data.events.slice(-100));
      } catch {}
    };

    poll();
    pollingRef.current = setInterval(poll, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [interview.id, activeChallengeIdx]);

  const handleSaveNote = useCallback(async () => {
    if (!note.trim()) return;
    const result = await saveNote(interview.id, note);
    if (result.success) {
      toast({ title: 'Заметка сохранена' });
      setNote('');
    }
  }, [note, interview.id, toast]);

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Live: {interview.title}</h3>
            <p className="text-muted-foreground text-sm">
              {interview.candidate.firstName} {interview.candidate.lastName}
            </p>
          </div>
          <Badge variant="default">LIVE</Badge>
        </div>

        <div className="flex gap-2">
          {interview.challenges.map((ch, i) => (
            <Button
              key={ch.id}
              variant={i === activeChallengeIdx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveChallengeIdx(i)}
            >
              {ch.challenge.name} {ch.isSubmitted ? '✓' : ''}
            </Button>
          ))}
        </div>

        {challenge && (
          <div className="rounded-lg border">
            <div className="flex items-center justify-between bg-muted px-4 py-2">
              <span className="font-medium">{challenge.challenge.name}</span>
              <Badge variant="outline">{challenge.challenge.difficulty}</Badge>
            </div>
            <pre className="max-h-[500px] overflow-auto p-4 text-sm">
              <code>{code || 'Кандидат ещё не начал писать код...'}</code>
            </pre>
          </div>
        )}

        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium">Лог событий</h4>
          <div className="max-h-[200px] space-y-1 overflow-auto">
            {events.length === 0 && (
              <p className="text-muted-foreground text-xs">Ожидание действий кандидата...</p>
            )}
            {events.map((ev: any, i: number) => (
              <div key={i} className="text-xs">
                <span className="text-muted-foreground">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                {' '}
                <Badge variant="outline" className="text-[10px]">{ev.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-80 space-y-4">
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Заметки рекрутера</h4>
          <Textarea
            placeholder="Комментарий к решению..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
          />
          <Button className="mt-2 w-full" size="sm" onClick={handleSaveNote}>
            Сохранить заметку
          </Button>
        </div>
      </div>
    </div>
  );
}
