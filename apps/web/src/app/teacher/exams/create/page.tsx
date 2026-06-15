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
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="mb-8 text-3xl font-bold">Создать новый тест</h1>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="rounded border border-red-400 bg-red-100 p-4 text-red-700">{error}</div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Название теста *</Label>
            <Input
              id="title"
              placeholder="Например: Математика 9 класс - Геометрия"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <textarea
              id="description"
              placeholder="Опишите тест и его цели..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classLevel">Класс/Группа *</Label>
            <Input
              id="classLevel"
              placeholder="Например: 9А, 10Б, 11В"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Максимум попыток</Label>
            <Input
              id="maxAttempts"
              type="number"
              min="1"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="showResults"
              type="checkbox"
              checked={showResultsImmediately}
              onChange={(e) => setShowResultsImmediately(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showResults" className="mb-0">
              Показывать результаты студентам сразу после отправки
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать тест'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
