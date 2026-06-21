'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Question {
  id: string;
  order: number;
  type: string;
  content: string;
  points: number;
  language?: string;
  options?: string[];
  correctAnswers?: number[];
}

interface ExamData {
  title: string;
  description: string;
  questions: Question[];
}

interface SessionData {
  id: string;
  status: string;
  startedAt: string;
  exam: ExamData;
  answers: {
    id: string;
    questionId: string;
    answer: string;
  }[];
}

export default function ExamSessionPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exam-sessions/${sessionId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при загрузке сессии');
        return;
      }

      const data = await response.json();
      setSession(data.session);

      // Load previously saved answers
      const savedAnswers: Record<string, string> = {};
      data.session.answers.forEach((answer: { questionId: string; answer: string }) => {
        savedAnswers[answer.questionId] = answer.answer;
      });
      setAnswers(savedAnswers);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Ошибка при загрузке сессии');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchSession();
  }, [sessionId, fetchSession]);

  const saveAnswer = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    try {
      await fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
          action: 'save',
        }),
      });
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/exam-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка при отправке теста');
        return;
      }

      // Redirect to results
      router.push(`/exam/${shareToken}/session/${sessionId}/results`);
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Ошибка при отправке теста');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Загрузка теста...</p>
      </div>
    );
  }

  if (error && !session) {
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

  if (!session?.exam.questions || session.exam.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <p className="text-lg">Нет вопросов в этом тесте</p>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.exam.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Ошибка: вопрос не найден</p>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id] || '';
  const totalQuestions = session.exam.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-neutral-100">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent">
                {session.exam.title}
              </h1>
              <p className="mt-1.5 text-sm text-neutral-400">
                Вопрос {currentQuestionIndex + 1} из {totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Отвечено
              </p>
              <p className="text-2xl font-black text-amber-500">
                {answeredCount}/{totalQuestions}
              </p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-950 bg-red-950/40 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        {/* Questions Grid */}
        <div className="mb-8 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {session.exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`rounded-xl border-2 py-3.5 text-sm font-bold transition-all ${
                idx === currentQuestionIndex
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : answers[q.id]
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-amber-500/50 hover:text-neutral-200'
              }`}
            >
              {idx + 1}
              {answers[q.id] ? <span className="ml-1 text-emerald-500">✓</span> : null}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <Card className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="flex-1 text-xl font-bold text-neutral-100">
                {currentQuestion.content}
              </h2>
              <Badge
                variant="outline"
                className="ml-4 border-amber-500/20 bg-amber-500/10 px-3 py-1 font-bold text-amber-400"
              >
                {currentQuestion.points} баллов
              </Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Тип:{' '}
              {currentQuestion.type === 'MULTIPLE_CHOICE'
                ? 'Множественный выбор'
                : currentQuestion.type === 'CODE_TASK'
                  ? 'Программирование'
                  : 'Короткий ответ'}
            </p>
          </div>

          {/* Answer Area */}
          <div className="mb-6">
            {currentQuestion.type === 'MULTIPLE_CHOICE' ? (
              <div className="space-y-3">
                {(currentQuestion.options || []).map((option, idx) => (
                  <label
                    key={idx}
                    className={`p-4.5 flex cursor-pointer items-center rounded-xl border transition-colors ${
                      currentAnswer === idx.toString()
                        ? 'border-amber-500 bg-amber-500/10 font-semibold text-amber-300'
                        : 'border-zinc-800 bg-zinc-900/40 text-neutral-300 hover:bg-zinc-900/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={idx.toString()}
                      checked={currentAnswer === idx.toString()}
                      onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                      className="h-4.5 w-4.5 mr-3.5 border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion.type === 'CODE_TASK' ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Режим: {currentQuestion.language}
                </p>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                  placeholder="// Напишите ваше решение здесь..."
                  className="h-64 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-white placeholder-zinc-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Ваш ответ
                </p>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Введите ваш ответ здесь..."
                  className="h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="rounded-xl border-zinc-800 bg-zinc-900 px-6 py-5 text-neutral-300 shadow-sm hover:bg-zinc-800 hover:text-white"
          >
            ← Предыдущий
          </Button>

          <div className="flex gap-4">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="rounded-xl border-0 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 font-bold text-white shadow-md hover:from-amber-500 hover:to-orange-500 hover:shadow-lg"
              >
                Следующий →
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg">
                    Отправить тест
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-zinc-800 bg-zinc-900 text-white">
                  <AlertDialogTitle>Отправить тест?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Вы ответили на {answeredCount} из {totalQuestions} вопросов. Вы уверены, что
                    хотите завершить прохождение теста?
                  </AlertDialogDescription>
                  <div className="mt-4 flex justify-end gap-2">
                    <AlertDialogCancel className="rounded-xl border-zinc-800 bg-zinc-950 text-neutral-300 hover:bg-zinc-900 hover:text-white">
                      Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white hover:from-emerald-500 hover:to-teal-500"
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить'}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
