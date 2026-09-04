'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { useToast } from '@repo/ui/components/use-toast';

type ChallengeData = {
  id: string;
  challengeId: number;
  order: number;
  code: string;
  isSubmitted: boolean;
  challenge: {
    name: string;
    slug: string;
    difficulty: string;
    tests: string;
    code: string;
    description: string;
  };
};

type SessionData = {
  id: string;
  title: string;
  token: string;
  status: string;
  duration: number;
  candidate: { firstName: string; lastName: string };
  challenges: ChallengeData[];
};

export function InterviewRoom({ session }: { session: SessionData }) {
  const { toast } = useToast();
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(session.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [checking, setChecking] = useState(false);
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const challenge = session.challenges[activeChallengeIdx];

  useEffect(() => {
    if (challenge) {
      setCode(challenge.code || challenge.challenge.code || '');
    }
  }, [activeChallengeIdx, challenge]);

  const saveCode = useCallback(async (codeToSave: string) => {
    if (!challenge || !isRunning) return;
    try {
      await fetch('/api/interview/save-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          challengeId: challenge.id,
          code: codeToSave,
          passedTests: 0,
          totalTests: 1,
        }),
      });
    } catch {}
  }, [challenge, session.id, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      saveCode(code);
    }, 3000);

    return () => clearInterval(timer);
  }, [isRunning, code, saveCode]);

  const startInterview = useCallback(() => {
    setIsRunning(true);
    setTimeLeft(session.duration);

    fetch('/api/interview/save-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        challengeId: challenge?.id,
        code: code,
        type: 'START',
      }),
    });
  }, [session.id, session.duration, challenge?.id, code]);

  useEffect(() => {
    if (!isRunning) return;

    timeRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timeRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [isRunning]);

  const handleRun = useCallback(async () => {
    if (!challenge) return;
    setChecking(true);
    setOutput('');

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          tests: challenge.challenge.tests,
          language: 'python',
        }),
      });

      const result = await res.json();
      setOutput(result.output || result.error || 'Нет вывода');

      await fetch('/api/interview/save-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          challengeId: challenge.id,
          code,
          type: 'RUN',
          passedTests: result.success ? 1 : 0,
          totalTests: 1,
        }),
      });

      if (!result.success) {
        toast({ title: 'Тесты не пройдены', variant: 'destructive' });
      }
    } catch (e: any) {
      setOutput(`Ошибка: ${e.message}`);
    } finally {
      setChecking(false);
    }
  }, [code, challenge, session.id, toast]);

  const handleSubmit = useCallback(async () => {
    if (!challenge) return;
    setChecking(true);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          tests: challenge.challenge.tests,
          language: 'python',
        }),
      });

      const result = await res.json();

      await fetch('/api/interview/save-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          challengeId: challenge.id,
          code,
          passedTests: result.success ? 1 : 0,
          totalTests: 1,
          isSubmitted: true,
        }),
      });

      setOutput(result.success ? '✓ Решение принято!' : '✗ Тесты не пройдены');

      if (result.success) {
        toast({ title: 'Задача решена!' });
      }

      if (timeRef.current) clearInterval(timeRef.current);
      setIsRunning(false);
    } finally {
      setChecking(false);
    }
  }, [code, challenge, session.id, toast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isRunning) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-muted-foreground">
            {session.candidate.firstName} {session.candidate.lastName}
          </p>
          <p className="text-muted-foreground text-sm">
            {session.challenges.length} задач · {formatTime(session.duration)}
          </p>
          <Button onClick={startInterview}>Начать интервью</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="font-bold">{session.title}</h1>
          <div className="flex gap-1">
            {session.challenges.map((ch, i) => (
              <Button
                key={ch.id}
                variant={i === activeChallengeIdx ? 'default' : ch.isSubmitted ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  saveCode(code);
                  setActiveChallengeIdx(i);
                }}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
        <div className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : ''}`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1">
        <div className="flex w-1/3 flex-col border-r p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">{challenge?.challenge.name}</h2>
            {challenge && <Badge variant="outline">{challenge.challenge.difficulty}</Badge>}
          </div>
          <div className="flex-1 overflow-auto">
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {challenge?.challenge.description || 'Условие задачи'}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <textarea
            className="flex-1 resize-none border-0 bg-background p-4 font-mono text-sm outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          {output && (
            <div className="max-h-[200px] overflow-auto border-t bg-muted p-4">
              <pre className="text-sm whitespace-pre-wrap">{output}</pre>
            </div>
          )}

          <div className="flex items-center justify-between border-t p-2">
            <Button variant="outline" size="sm" onClick={handleRun} disabled={checking}>
              {checking ? 'Запуск...' : 'Запустить'}
            </Button>
            <Button onClick={handleSubmit} disabled={checking}>
              {checking ? 'Отправка...' : 'Завершить'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
