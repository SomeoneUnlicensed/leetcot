'use client';

import { useState, useEffect } from 'react';
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
  questions: any[];
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

  useEffect(() => {
    fetchExam();
  }, [shareToken]);

  const fetchExam = async () => {
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
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Загрузка теста...</p>
      </div>
    );
  }

  if (error && !exam) {
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

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <p className="text-lg">Тест не найден</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-lg">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-center">{exam.title}</h1>
            {exam.description && (
              <p className="text-gray-600 text-center mb-4">{exam.description}</p>
            )}
            <div className="bg-blue-50 p-4 rounded border border-blue-200 text-center">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Класс:</span> {exam.classLevel}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">Вопросов:</span> {exam.questions?.length || 0}
              </p>
            </div>
          </div>

          <form onSubmit={handleStartExam} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

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

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">⚠️ Внимание:</span> После начала теста вы не сможете вернуться на эту страницу. Убедитесь, что вы готовы.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isStarting}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              {isStarting ? 'Запуск теста...' : 'Начать тест'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-8">
          © ЛитКот Экзамены
        </p>
      </div>
    </div>
  );
}
