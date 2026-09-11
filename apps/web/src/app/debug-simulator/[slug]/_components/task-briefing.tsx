'use client';

import { DifficultyBadge } from '@repo/ui/components/difficulty-badge';
import type { Difficulty } from '@repo/db/types';
import { Markdown } from '@repo/ui/components/markdown';
import { useState, type ReactNode } from 'react';

interface TaskBriefingProps {
  title: string;
  difficulty: Difficulty;
  points: number;
  narrative: string;
  children: ReactNode;
}

export function TaskBriefing({ title, difficulty, points, narrative, children }: TaskBriefingProps) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#0a0e16] px-4 py-10">
      <div className="w-full max-w-xl">
        <p className="mb-4 text-center text-xs font-semibold tracking-[0.2em] text-[#00A0FF] uppercase">
          Брифинг · «Восход Ритейл»
        </p>

        <div className="mb-4 flex items-center justify-center gap-3">
          <DifficultyBadge difficulty={difficulty} />
          <span className="text-sm font-bold text-[#00A0FF]">{points} pts</span>
        </div>

        <h1 className="mb-5 text-center text-2xl font-bold text-white sm:text-3xl">{title}</h1>

        <div className="prose prose-invert mx-auto mb-8 max-w-none text-center text-[15px] leading-relaxed text-white/70">
          <Markdown>{narrative}</Markdown>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setStarted(true)}
            className="rounded-lg bg-[#00A0FF] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0090e6]"
          >
            Понятно, начать
          </button>
        </div>
      </div>
    </div>
  );
}
