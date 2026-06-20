'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Confetti } from '~/components/confetti';

interface ExamResult {
  id: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isGraded: boolean;
  comments?: string;
}

interface Session {
  id: string;
  studentName: string;
  studentSurname?: string;
  studentClass: string;
  submittedAt: string;
  exam: {
    title: string;
    description: string;
  };
}

interface ResultData {
  session: Session;
  result: ExamResult;
}

export default function ExamResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exam-sessions/${sessionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка при загрузке результатов');
        return;
      }

      const responseData = await response.json();
      const session = responseData.session;

      if (!session.result) {
        setError('Результаты еще не готовы');
        return;
      }

      setData({
        session,
        result: session.result,
      });
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Ошибка при загрузке результатов');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchResults();
  }, [sessionId, fetchResults]);

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Отлично', color: 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' };
    if (percentage >= 60) return { label: 'Хорошо', color: 'bg-amber-500/20 border border-amber-500/30 text-amber-400' };
    if (percentage >= 40) return { label: 'Удовлетворительно', color: 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' };
    return { label: 'Неудовлетворительно', color: 'bg-red-500/20 border border-red-500/30 text-red-400' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-lg">Загрузка результатов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Card className="w-full max-w-md p-8 border-zinc-800 bg-zinc-900/40 text-center">
          <div className="text-red-400">
            <p className="mb-2 text-lg font-semibold">Ошибка</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Card className="w-full max-w-md p-8 border-zinc-800 bg-zinc-900/40 text-center">
          <div>
            <p className="text-lg text-neutral-400">Результаты не найдены</p>
          </div>
        </Card>
      </div>
    );
  }

  const { session, result } = data;
  const badge = getScoreBadge(result.percentage);

  return (
    <div className="min-h-screen bg-zinc-950 text-neutral-100 px-4 py-12">
      <Confetti />
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-white">Тест завершен!</h1>
          <p className="text-neutral-400 text-sm">Спасибо за прохождение теста</p>
        </div>

        {/* Exam Info */}
        <Card className="mb-8 border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 rounded-2xl shadow-xl">
          <h2 className="mb-2 text-xl font-bold text-white">{session.exam.title}</h2>
          {session.exam.description ? (
            <p className="mb-4 text-neutral-300 text-sm">{session.exam.description}</p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 text-xs tracking-wide">
            <div>
              <p className="text-neutral-500 font-bold uppercase">Студент</p>
              <p className="font-semibold text-neutral-200 mt-1 text-sm">
                {session.studentName} {session.studentSurname || ''}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 font-bold uppercase">Класс</p>
              <p className="font-semibold text-neutral-200 mt-1 text-sm">{session.studentClass}</p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="mb-8 p-8 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">Ваш результат</p>
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="text-6xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-left">
                <p className="text-2xl font-extrabold text-neutral-200">
                  {result.totalScore}/{result.maxScore}
                </p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">баллов</p>
              </div>
            </div>
            <Badge className={`${badge.color} px-4 py-2 text-sm font-bold`}>{badge.label}</Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-xs text-neutral-400">
              <span className="font-bold text-neutral-500 uppercase">Прогресс</span>
              <span>
                {result.totalScore}/{result.maxScore}
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-xs">
            <div>
              <p className="text-neutral-500 font-bold uppercase tracking-wider">Статус проверки</p>
              <p className="font-semibold text-neutral-200 mt-1 text-sm">{result.isGraded ? 'Проверено' : 'На проверке'}</p>
            </div>
            <div>
              <p className="text-neutral-500 font-bold uppercase tracking-wider">Время отправки</p>
              <p className="font-semibold text-neutral-200 mt-1 text-sm">
                {new Date(session.submittedAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>

          {result.comments ? (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="mb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">Комментарии учителя</p>
              <p className="text-neutral-300 text-sm">{result.comments}</p>
            </div>
          ) : null}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="mb-6 text-neutral-400 text-sm">Результаты автоматически сохранены и отправлены учителю.</p>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="rounded-xl px-6 py-5 shadow-sm border-zinc-800 bg-zinc-900 text-neutral-300 hover:bg-zinc-800 hover:text-white"
          >
            Вернуться на главную
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-neutral-600">© ЛитКот Экзамены</p>
      </div>
    </div>
  );
}
