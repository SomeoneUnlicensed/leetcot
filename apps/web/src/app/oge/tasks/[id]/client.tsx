'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Markdown } from '@repo/ui/components/markdown';

interface TaskData {
  id: number;
  examQuestionNumber: number;
  difficulty: string;
  prompt: string;
  taskData: Record<string, unknown> | null;
  type: string;
  correctAnswer: string;
  solution: string;
}

interface AttemptData {
  answer: string;
  isCorrect: boolean;
  createdAt: string;
}

interface OgeTaskClientProps {
  task: TaskData;
  trackSlug: string;
  trackName: string;
  lastAttempt: AttemptData | null;
}

export function OgeTaskClient({ task, trackSlug, trackName, lastAttempt }: OgeTaskClientProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const normalizedUserAnswer = answer.trim().toLowerCase();
  const normalizedCorrect = task.correctAnswer.trim().toLowerCase();
  const isExactMatch = normalizedUserAnswer === normalizedCorrect;

  const handleSubmit = async () => {
    setSubmitting(true);

    const correct = isExactMatch;
    setIsCorrect(correct);
    setSubmitted(true);

    try {
      await fetch('/api/oge/submit-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, answer: answer.trim(), isCorrect: correct }),
      });
    } catch {
      // silent fail - answer still shown
    }

    setSubmitting(false);
  };

  const handleRetry = () => {
    setAnswer('');
    setSubmitted(false);
    setShowSolution(false);
  };

  const difficultyLabel =
    task.difficulty === 'BASIC'
      ? 'Базовый'
      : task.difficulty === 'ADVANCED'
        ? 'Повышенный'
        : 'Высокий';

  const difficultyClass =
    task.difficulty === 'BASIC'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
      : task.difficulty === 'ADVANCED'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
        : 'border-rose-400/30 bg-rose-400/10 text-rose-300';

  return (
    <div className="container py-8">
      <Link
        href={`/oge/modules/${trackSlug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
      >
        ← К модулю
      </Link>

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8]">
              {trackName} · задание
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${difficultyClass}`}
            >
              {difficultyLabel}
            </span>
          </div>
          <h1
            className="mt-3 text-2xl leading-tight md:text-3xl"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            Задание №{task.examQuestionNumber} КИМ
          </h1>
        </div>

        {/* Task prompt */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <article className="prose prose-invert max-w-none prose-p:text-[#d8d4df]/90 prose-strong:text-white prose-code:text-[#8ef0de] prose-code:bg-white/5 prose-code:rounded prose-code:px-1 prose-pre:bg-[#1a1528] prose-pre:border prose-pre:border-white/10">
            <Markdown>{task.prompt}</Markdown>
          </article>
        </div>

        {/* Answer area */}
        {!submitted ? (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[#d8d4df]/70">Ваш ответ:</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && answer.trim()) handleSubmit();
              }}
              placeholder="Введите ответ..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-lg text-white placeholder-[#d8d4df]/30 outline-none transition focus:border-[#ff8ecb]/50 focus:bg-white/[0.06]"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff8ecb] to-[#8ef0de] px-8 text-base font-black text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? 'Проверяем...' : 'Проверить'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Result */}
            <div
              className={`rounded-2xl border p-6 ${
                isCorrect
                  ? 'border-emerald-400/30 bg-emerald-400/10'
                  : 'border-rose-400/30 bg-rose-400/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                <div>
                  <p className="text-lg font-bold text-white">
                    {isCorrect ? 'Верно!' : 'Неверно'}
                  </p>
                  {!isCorrect && (
                    <p className="mt-1 text-sm text-[#d8d4df]/60">
                      Правильный ответ: <span className="font-bold text-white">{task.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Solution */}
            <div>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
              >
                {showSolution ? 'Скрыть' : 'Показать'} разбор решения
              </button>
              {showSolution && (
                <div className="mt-4 rounded-2xl border border-[#8ef0de]/20 bg-[#8ef0de]/5 p-6">
                  <article className="prose prose-invert max-w-none prose-p:text-[#d8d4df]/85 prose-strong:text-white prose-code:text-[#8ef0de] prose-code:bg-white/5">
                    <Markdown>{task.solution}</Markdown>
                  </article>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleRetry}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Решить снова
              </button>
              <Link
                href={`/oge/modules/${trackSlug}`}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Другие задания
              </Link>
            </div>
          </div>
        )}

        {/* Previous attempts */}
        {!submitted && lastAttempt && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="mb-2 text-xs font-semibold text-[#d8d4df]/40">Последняя попытка:</p>
            <div className="flex items-center gap-2">
              <span className={lastAttempt.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                {lastAttempt.isCorrect ? '✅' : '❌'}
              </span>
              <span className="text-sm text-[#d8d4df]/60">
                Ваш ответ: <span className="font-medium text-white">{lastAttempt.answer}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
