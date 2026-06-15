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
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{session.exam.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Вопрос {currentQuestionIndex + 1} из {totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ответено:</p>
              <p className="text-2xl font-bold text-blue-600">
                {answeredCount}/{totalQuestions}
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-4 gap-4">
          {session.exam.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`rounded border-2 p-3 transition-all ${
                idx === currentQuestionIndex
                  ? 'border-blue-600 bg-blue-50 font-bold'
                  : answers[q.id]
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {idx + 1}
              {answers[q.id] ? <span className="ml-1 text-green-600">✓</span> : null}
            </button>
          ))}
        </div>

        {/* Question */}
        <Card className="mb-8 p-8">
          <div className="mb-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="flex-1 text-xl font-semibold">{currentQuestion.content}</h2>
              <Badge variant="outline" className="ml-4">
                {currentQuestion.points} баллов
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
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
                    className="flex cursor-pointer items-center rounded border border-gray-300 p-4 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={idx.toString()}
                      checked={currentAnswer === idx.toString()}
                      onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                      className="mr-3 h-4 w-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion.type === 'CODE_TASK' ? (
              <div>
                <p className="mb-3 text-sm text-gray-600">Язык: {currentQuestion.language}</p>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Введите код..."
                  className="h-48 w-full rounded border border-gray-300 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <textarea
                value={currentAnswer}
                onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                placeholder="Введите ответ..."
                className="h-24 w-full rounded border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          >
            ← Предыдущий
          </Button>

          <div className="flex gap-4">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
              >
                Следующий →
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">Отправить тест</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Отправить тест?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы ответили на {answeredCount} из {totalQuestions} вопросов. Вы уверены, что
                    хотите отправить тест?
                  </AlertDialogDescription>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
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
