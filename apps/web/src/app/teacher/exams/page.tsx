'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@repo/ui/components/alert-dialog';
import { useRouter } from 'next/navigation';

interface Exam {
  id: string;
  title: string;
  description: string;
  classLevel: string;
  status: string;
  createdAt: string;
  questions: any[];
  sessions: any[];
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exams');
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке тестов');
        return;
      }

      const data = await response.json();
      setExams(data.exams || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Ошибка при загрузке тестов');
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id: string) => {
    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при удалении теста');
        return;
      }

      setExams(exams.filter(exam => exam.id !== id));
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('Ошибка при удалении теста');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      DRAFT: { label: 'Черновик', variant: 'default' },
      ACTIVE: { label: 'Активен', variant: 'default' },
      CLOSED: { label: 'Закрыт', variant: 'secondary' },
      ARCHIVED: { label: 'Архивирован', variant: 'secondary' },
    };
    const config = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мои тесты</h1>
        <Link href="/teacher/exams/create">
          <Button>Создать новый тест</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {exams.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">У вас еще нет тестов</p>
          <Link href="/teacher/exams/create">
            <Button>Создать первый тест</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
                  <p className="text-gray-600 mb-2">{exam.description}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>Класс: {exam.classLevel}</span>
                    <span>Вопросов: {exam.questions?.length || 0}</span>
                    <span>Попыток: {exam.sessions?.length || 0}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    {getStatusBadge(exam.status)}
                    <span className="text-sm text-gray-500">
                      Создан: {new Date(exam.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/teacher/exams/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      Редактировать
                    </Button>
                  </Link>
                  <Link href={`/teacher/exams/${exam.id}/results`}>
                    <Button variant="outline" size="sm">
                      Результаты
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Тест будет удален навсегда.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteExam(exam.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
