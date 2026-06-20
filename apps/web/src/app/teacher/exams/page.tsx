'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';

interface Exam {
  id: string;
  title: string;
  description: string;
  classLevel: string;
  status: string;
  createdAt: string;
  questions: unknown[];
  sessions: unknown[];
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

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

      setExams(exams.filter((exam) => exam.id !== id));
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError('Ошибка при удалении теста');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }
    > = {
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-lg text-neutral-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-zinc-950 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Мои тесты</h1>
        <Link href="/teacher/exams/create">
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold border-0 text-white py-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            Создать новый тест
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-950 bg-red-950/40 p-4 text-red-400 text-sm">
          {error}
        </div>
      ) : null}

      {exams.length === 0 ? (
        <Card className="p-8 text-center border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-xl">
          <p className="mb-6 text-zinc-400">У вас еще нет тестов</p>
          <Link href="/teacher/exams/create">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold text-white border-0 py-5 rounded-xl">
              Создать первый тест
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-5">
          {exams.map((exam) => (
            <Card key={exam.id} className="p-6 border-zinc-800 bg-zinc-900/40 rounded-2xl shadow-xl hover:border-zinc-700 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="mb-2 text-xl font-bold text-white">{exam.title}</h2>
                  <p className="mb-3 text-sm text-zinc-400">{exam.description}</p>
                  <div className="mb-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <span>Класс: <span className="text-zinc-300">{exam.classLevel}</span></span>
                    <span>Вопросов: <span className="text-zinc-300">{exam.questions?.length || 0}</span></span>
                    <span>Попыток: <span className="text-zinc-300">{exam.sessions?.length || 0}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {getStatusBadge(exam.status)}
                    <span className="text-zinc-500 font-medium">
                      Создан: {new Date(exam.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link href={`/teacher/exams/${exam.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-zinc-800 bg-zinc-900 text-neutral-300 hover:bg-zinc-850 hover:text-white">
                      Редактировать
                    </Button>
                  </Link>
                  <Link href={`/teacher/exams/${exam.id}/results`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-zinc-800 bg-zinc-900 text-neutral-300 hover:bg-zinc-850 hover:text-white">
                      Результаты
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="rounded-xl border-0 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white transition-colors">
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl bg-zinc-900 border-zinc-800 text-white">
                      <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Это действие нельзя отменить. Тест будет удален навсегда.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2 mt-4">
                        <AlertDialogCancel className="rounded-xl border-zinc-800 bg-zinc-950 text-neutral-300 hover:bg-zinc-900">Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteExam(exam.id)}
                          className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold border-0"
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
