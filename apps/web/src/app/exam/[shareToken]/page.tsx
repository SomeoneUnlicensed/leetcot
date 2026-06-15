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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 shadow-lg">
          <div className="mb-8">
            <h1 className="mb-2 text-center text-3xl font-bold">{exam.title}</h1>
            {exam.description ? (
              <p className="mb-4 text-center text-gray-600">{exam.description}</p>
            ) : null}
            <div className="rounded border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Класс:</span> {exam.classLevel}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                <span className="font-semibold">Вопросов:</span> {exam.questions?.length || 0}
              </p>
            </div>
          </div>

          <form onSubmit={handleStartExam} className="space-y-6">
            {error ? (
              <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="studentName">Ваше имя *</Label>
              <Input
                id="studentName"
                placeholder="Например: Иван"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentSurname">Фамилия</Label>
              <Input
                id="studentSurname"
                placeholder="Например: Петров"
                value={studentSurname}
                onChange={(e) => setStudentSurname(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentClass">Ваш класс *</Label>
              <Input
                id="studentClass"
                placeholder="Например: 9А"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                required
              />
            </div>

            <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">⚠️ Внимание:</span> После начала теста вы не сможете
                вернуться на эту страницу. Убедитесь, что вы готовы.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isStarting}
              className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
            >
              {isStarting ? 'Запуск теста...' : 'Начать тест'}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-500">© ЛитКот Экзамены</p>
      </div>
    </div>
  );
}
