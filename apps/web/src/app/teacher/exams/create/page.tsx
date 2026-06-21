'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Card } from '@repo/ui/components/card';
import { Label } from '@repo/ui/components/label';

export default function CreateExamPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !classLevel) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          classLevel,
          maxAttempts: parseInt(maxAttempts),
          showResultsImmediately,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при создании теста');
        return;
      }

      const data = await response.json();
      router.push(`/teacher/exams/${data.exam.id}`);
    } catch (err) {
      console.error('Error creating exam:', err);
      setError('Ошибка при создании теста');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-500 transition-colors hover:text-amber-400"
          >
            ← Назад к списку
          </button>
          <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent">
            Создать новый тест
          </h1>
        </div>

        <Card className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium text-zinc-300">
                Название теста *
              </Label>
              <Input
                id="title"
                placeholder="Например: Математика 9 класс - Геометрия"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium text-zinc-300">
                Описание
              </Label>
              <textarea
                id="description"
                placeholder="Опишите тест и его цели..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="classLevel" className="font-medium text-zinc-300">
                  Класс/Группа *
                </Label>
                <Input
                  id="classLevel"
                  placeholder="Например: 9А, 10Б"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                  className="border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts" className="font-medium text-zinc-300">
                  Максимум попыток
                </Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="border-zinc-850 flex items-center space-x-3 rounded-lg border bg-zinc-900/30 p-3">
              <input
                id="showResults"
                type="checkbox"
                checked={showResultsImmediately}
                onChange={(e) => setShowResultsImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-950"
              />
              <Label
                htmlFor="showResults"
                className="mb-0 cursor-pointer select-none text-xs font-semibold text-zinc-400"
              >
                Показывать результаты студентам сразу после отправки
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="border-0 bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-lg shadow-amber-500/10 hover:from-amber-600 hover:to-orange-700"
              >
                {loading ? 'Создание...' : 'Создать тест'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
