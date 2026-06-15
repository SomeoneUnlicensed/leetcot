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
    if (percentage >= 80) return { label: 'Отлично', color: 'bg-green-600' };
    if (percentage >= 60) return { label: 'Хорошо', color: 'bg-blue-600' };
    if (percentage >= 40) return { label: 'Удовлетворительно', color: 'bg-yellow-600' };
    return { label: 'Неудовлетворительно', color: 'bg-red-600' };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка результатов...</p>
      </div>
    );
  }

  if (error) {
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

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <p className="text-lg">Результаты не найдены</p>
          </div>
        </Card>
      </div>
    );
  }

  const { session, result } = data;
  const badge = getScoreBadge(result.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <Confetti />
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Тест завершен!</h1>
          <p className="text-gray-600">Спасибо за прохождение теста</p>
        </div>

        {/* Exam Info */}
        <Card className="mb-8 border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-2 text-xl font-semibold">{session.exam.title}</h2>
          {session.exam.description ? (
            <p className="mb-4 text-gray-700">{session.exam.description}</p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Студент</p>
              <p className="font-semibold">
                {session.studentName} {session.studentSurname || ''}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Класс</p>
              <p className="font-semibold">{session.studentClass}</p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="mb-8 p-8">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm text-gray-600">Ваш результат</p>
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="text-6xl font-bold text-blue-600">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {result.totalScore}/{result.maxScore}
                </p>
                <p className="text-sm text-gray-600">баллов</p>
              </div>
            </div>
            <Badge className={`${badge.color} px-4 py-2 text-lg text-white`}>{badge.label}</Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Прогресс</span>
              <span>
                {result.totalScore}/{result.maxScore}
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-blue-600 transition-all"
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-600">Статус проверки</p>
              <p className="font-semibold">{result.isGraded ? 'Проверено' : 'На проверке'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Время отправки</p>
              <p className="font-semibold">
                {new Date(session.submittedAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>

          {result.comments ? (
            <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm text-gray-600">Комментарии учителя</p>
              <p className="text-gray-800">{result.comments}</p>
            </div>
          ) : null}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="mb-6 text-gray-600">Спасибо за участие! Результаты отправлены учителю.</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            Вернуться на главную
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">© ЛитКот Экзамены</p>
      </div>
    </div>
  );
}
