'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import Link from 'next/link';

interface ExamResult {
  id: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  session: {
    studentName: string;
    studentSurname?: string;
    studentClass: string;
    submittedAt: string;
  };
}

interface Statistics {
  totalSessions: number;
  avgScore: number;
  avgPercentage: number;
  maxScoreOverall: number;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.id as string;
  const [results, setResults] = useState<ExamResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}/results`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке результатов');
        return;
      }

      const data = await response.json();
      setResults(data.results || []);
      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Ошибка при загрузке результатов');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (examId) {
      void fetchResults();
    }
  }, [examId, fetchResults]);

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) {
      return (
        <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20">
          Отлично
        </Badge>
      );
    }
    if (percentage >= 60) {
      return (
        <Badge className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/20">
          Хорошо
        </Badge>
      );
    }
    if (percentage >= 40) {
      return (
        <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20">
          Удовлетворительно
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20">
        Неудовлетворительно
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/teacher/exams"
              className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-500 transition-colors hover:text-amber-400"
            >
              ← Назад к тестам
            </Link>
            <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent">
              Результаты теста
            </h1>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {statistics ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Всего попыток
              </h3>
              <p className="text-3xl font-extrabold text-neutral-100">{statistics.totalSessions}</p>
            </Card>
            <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Средний балл
              </h3>
              <p className="text-3xl font-extrabold text-amber-500">
                {statistics.avgScore.toFixed(1)}
              </p>
            </Card>
            <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Средний %
              </h3>
              <p className="text-3xl font-extrabold text-orange-400">
                {statistics.avgPercentage.toFixed(1)}%
              </p>
            </Card>
            <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                Макс. балл
              </h3>
              <p className="text-3xl font-extrabold text-emerald-400">
                {statistics.maxScoreOverall}
              </p>
            </Card>
          </div>
        ) : null}

        <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="mb-6 text-xl font-bold text-neutral-100">Результаты студентов</h2>

          {results.length === 0 ? (
            <p className="py-10 text-center text-zinc-500">Нет результатов</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                    <th className="px-4 py-3 text-left font-bold">Студент</th>
                    <th className="px-4 py-3 text-left font-bold">Класс</th>
                    <th className="px-4 py-3 text-left font-bold">Балл</th>
                    <th className="px-4 py-3 text-left font-bold">%</th>
                    <th className="px-4 py-3 text-left font-bold">Статус</th>
                    <th className="px-4 py-3 text-left font-bold">Время</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      className="transition-colors duration-150 hover:bg-zinc-900/30"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-zinc-200">
                        {result.session.studentName}{' '}
                        {result.session.studentSurname ? result.session.studentSurname : ''}
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-300">
                        {result.session.studentClass}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-zinc-100">
                        {result.totalScore} / {result.maxScore}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-zinc-300">
                        {result.percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-4 text-sm">{getScoreBadge(result.percentage)}</td>
                      <td className="px-4 py-4 text-sm text-zinc-500">
                        {new Date(result.session.submittedAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
