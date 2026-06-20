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
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors font-semibold py-0.5 px-2.5 rounded-full text-xs">
          Отлично
        </Badge>
      );
    }
    if (percentage >= 60) {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-semibold py-0.5 px-2.5 rounded-full text-xs">
          Хорошо
        </Badge>
      );
    }
    if (percentage >= 40) {
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors font-semibold py-0.5 px-2.5 rounded-full text-xs">
          Удовлетворительно
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-semibold py-0.5 px-2.5 rounded-full text-xs">
        Неудовлетворительно
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-zinc-400 text-sm font-medium">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/teacher/exams"
              className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 mb-2"
            >
              ← Назад к тестам
            </Link>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Результаты теста
            </h1>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-red-400 text-sm">
            {error}
          </div>
        ) : null}

        {statistics ? (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Всего попыток</h3>
              <p className="text-3xl font-extrabold text-neutral-100">{statistics.totalSessions}</p>
            </Card>
            <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Средний балл</h3>
              <p className="text-3xl font-extrabold text-amber-500">{statistics.avgScore.toFixed(1)}</p>
            </Card>
            <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Средний %</h3>
              <p className="text-3xl font-extrabold text-orange-400">{statistics.avgPercentage.toFixed(1)}%</p>
            </Card>
            <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-zinc-400">Макс. балл</h3>
              <p className="text-3xl font-extrabold text-emerald-400">{statistics.maxScoreOverall}</p>
            </Card>
          </div>
        ) : null}

        <Card className="p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl dark:border-zinc-800 dark:bg-zinc-900/40">
          <h2 className="mb-6 text-xl font-bold text-neutral-100">Результаты студентов</h2>

          {results.length === 0 ? (
            <p className="text-zinc-500 text-center py-10">Нет результатов</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
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
                    <tr key={result.id} className="hover:bg-zinc-900/30 transition-colors duration-150">
                      <td className="px-4 py-4 text-sm font-semibold text-zinc-200">
                        {result.session.studentName}{' '}
                        {result.session.studentSurname ? result.session.studentSurname : ''}
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-300">{result.session.studentClass}</td>
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

