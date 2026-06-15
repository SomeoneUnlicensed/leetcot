'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';

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
    if (percentage >= 80) return <Badge className="bg-green-600">Отлично</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-600">Хорошо</Badge>;
    if (percentage >= 40) return <Badge className="bg-yellow-600">Удовлетворительно</Badge>;
    return <Badge className="bg-red-600">Неудовлетворительно</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Результаты теста</h1>

      {error ? (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {statistics ? (
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Card className="p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">Всего попыток</h3>
            <p className="text-3xl font-bold">{statistics.totalSessions}</p>
          </Card>
          <Card className="p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">Средний балл</h3>
            <p className="text-3xl font-bold">{statistics.avgScore.toFixed(1)}</p>
          </Card>
          <Card className="p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">Средний %</h3>
            <p className="text-3xl font-bold">{statistics.avgPercentage.toFixed(1)}%</p>
          </Card>
          <Card className="p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-600">Макс. баллов</h3>
            <p className="text-3xl font-bold">{statistics.maxScoreOverall}</p>
          </Card>
        </div>
      ) : null}

      <Card className="p-6">
        <h2 className="mb-4 text-2xl font-bold">Результаты студентов</h2>

        {results.length === 0 ? (
          <p className="text-gray-600">Нет результатов</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-semibold">Студент</th>
                  <th className="px-4 py-2 text-left font-semibold">Класс</th>
                  <th className="px-4 py-2 text-left font-semibold">Балл</th>
                  <th className="px-4 py-2 text-left font-semibold">%</th>
                  <th className="px-4 py-2 text-left font-semibold">Статус</th>
                  <th className="px-4 py-2 text-left font-semibold">Время</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {result.session.studentName}{' '}
                      {result.session.studentSurname ? result.session.studentSurname : null}
                    </td>
                    <td className="px-4 py-3">{result.session.studentClass}</td>
                    <td className="px-4 py-3 font-semibold">
                      {result.totalScore}/{result.maxScore}
                    </td>
                    <td className="px-4 py-3">{result.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-3">{getScoreBadge(result.percentage)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(result.session.submittedAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
