'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';

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
  const shareToken = params.shareToken as string;
  const sessionId = params.sessionId as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
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
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Отлично', color: 'bg-green-600' };
    if (percentage >= 60) return { label: 'Хорошо', color: 'bg-blue-600' };
    if (percentage >= 40) return { label: 'Удовлетворительно', color: 'bg-yellow-600' };
    return { label: 'Неудовлетворительно', color: 'bg-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Загрузка результатов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
          <div className="text-red-600 text-center">
            <p className="text-lg font-semibold mb-2">Ошибка</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Тест завершен!</h1>
          <p className="text-gray-600">Спасибо за прохождение теста</p>
        </div>

        {/* Exam Info */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-2">{session.exam.title}</h2>
          {session.exam.description && (
            <p className="text-gray-700 mb-4">{session.exam.description}</p>
          )}
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
        <Card className="p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm mb-2">Ваш результат</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-6xl font-bold text-blue-600">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{result.totalScore}/{result.maxScore}</p>
                <p className="text-gray-600 text-sm">баллов</p>
              </div>
            </div>
            <Badge className={`${badge.color} text-white px-4 py-2 text-lg`}>
              {badge.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Прогресс</span>
              <span>{result.totalScore}/{result.maxScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-gray-600 text-sm">Статус проверки</p>
              <p className="font-semibold">
                {result.isGraded ? 'Проверено' : 'На проверке'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Время отправки</p>
              <p className="font-semibold">
                {new Date(session.submittedAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>

          {result.comments && (
            <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Комментарии учителя</p>
              <p className="text-gray-800">{result.comments}</p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Спасибо за участие! Результаты отправлены учителю.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Вернуться на главную
          </Button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          © ЛитКот Экзамены
        </p>
      </div>
    </div>
  );
}
