'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

interface Exam {
  id: string;
  title: string;
  description: string;
  classLevel: string;
  questions: unknown[];
}

export default function ExamAccessPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentSurname, setStudentSurname] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exam-access/${shareToken}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке теста');
        return;
      }

      const data = await response.json();
      setExam(data.exam);
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Ошибка при загрузке теста');
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    void fetchExam();
  }, [shareToken, fetchExam]);

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !studentClass) {
      setError('Пожалуйста, введите имя и класс');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      // Create a session
      const response = await fetch('/api/exam-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: exam?.id,
          studentName,
          studentSurname,
          studentClass,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при создании сессии');
        return;
      }

      const data = await response.json();
      const sessionId = data.session.id;

      // Redirect to exam session
      router.push(`/exam/${shareToken}/session/${sessionId}`);
    } catch (err) {
      console.error('Error starting exam:', err);
      setError('Ошибка при запуске теста');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка теста...</p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center text-red-600">
            <p className="mb-2 text-lg font-semibold">Ошибка</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <p className="text-lg">Тест не найден</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-neutral-100 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="p-8 shadow-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-8">
            <h1 className="mb-3 text-center text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {exam.title}
            </h1>
            {exam.description ? (
              <p className="mb-5 text-center text-neutral-400 text-sm">
                {exam.description}
              </p>
            ) : null}
            
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 text-center">
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Класс</p>
                <p className="mt-1 font-bold text-neutral-200 text-lg">{exam.classLevel}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Вопросов</p>
                <p className="mt-1 font-bold text-neutral-200 text-lg">{exam.questions?.length || 0}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleStartExam} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-950 bg-red-950/40 p-4 text-red-400 text-sm">
                {error}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="studentName" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Ваше имя *
              </Label>
              <Input
                id="studentName"
                placeholder="Например: Иван"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="rounded-xl bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentSurname" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Фамилия
              </Label>
              <Input
                id="studentSurname"
                placeholder="Например: Петров"
                value={studentSurname}
                onChange={(e) => setStudentSurname(e.target.value)}
                className="rounded-xl bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentClass" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Ваш класс *
              </Label>
              <Input
                id="studentClass"
                placeholder="Например: 9А"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="rounded-xl bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-500 focus:ring-amber-500/20"
                required
              />
            </div>

            <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-4 text-amber-300 text-xs">
              <span className="font-bold">⚠️ Внимание:</span> После запуска теста страница зафиксирует ваше участие. Пожалуйста, не закрывайте вкладку до окончания отправки результатов.
            </div>

            <Button
              type="submit"
              disabled={isStarting}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold transition-all duration-300 py-6 rounded-xl shadow-md hover:shadow-lg border-0 text-md"
            >
              {isStarting ? 'Запуск теста...' : 'Начать тест'}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-neutral-600">© ЛитКот Экзамены</p>
      </div>
    </div>
  );
}
