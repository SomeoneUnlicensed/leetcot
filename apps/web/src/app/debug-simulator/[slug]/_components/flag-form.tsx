'use client';

import { CornerDownLeft, Loader2 } from '@repo/ui/icons';
import { cn } from '@repo/ui/cn';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FlagFormProps {
  slug: string;
  points: number;
  initiallySolved: boolean;
  variant?: 'dark' | 'light';
}

export function FlagForm({ slug, points, initiallySolved, variant = 'light' }: FlagFormProps) {
  const router = useRouter();
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(initiallySolved);
  const [error, setError] = useState<string | null>(null);
  const dark = variant === 'dark';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!flag.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/debug-tasks/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Что-то пошло не так.');
      } else if (data.solved) {
        setSolved(true);
        router.refresh();
      } else {
        setError(data.error ?? 'Неверный флаг.');
      }
    } catch {
      setError('Не удалось отправить флаг. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // Dark variant renders as a line inside the terminal itself — no card, no border,
  // no button chrome — so submitting the flag reads as part of the shell session
  // instead of a separate web form bolted underneath it.
  if (dark) {
    if (solved) {
      return (
        <div className="flex items-center gap-2 px-6 py-3 font-mono text-sm">
          <span className="text-emerald-400">flag$</span>
          <span className="text-emerald-400/80"># решено — +{points} очков</span>
        </div>
      );
    }

    return (
      <div className="px-6 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 font-mono text-sm">
          <span className="shrink-0 text-[#00A0FF]">flag$</span>
          <input
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="submit LENTA{...}"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-white caret-[#00A0FF] outline-none placeholder:text-white/25"
          />
          <button
            type="submit"
            disabled={loading}
            aria-label="Отправить флаг"
            className="shrink-0 text-white/30 transition-colors hover:text-[#00A0FF] disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
          </button>
        </form>
        {error ? <p className="mt-1.5 font-mono text-xs text-red-400">-- {error}</p> : null}
      </div>
    );
  }

  if (solved) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
        <span className="font-semibold">Решено</span>
        <span className="text-emerald-600/70">+{points} очков</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-[#131722]/15 pb-1">
        <input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="LENTA{...}"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#131722] outline-none placeholder:text-[#131722]/30"
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'shrink-0 text-sm font-bold text-[#00A0FF] transition-colors hover:text-[#0090e6]',
            loading && 'opacity-50',
          )}
        >
          {loading ? '...' : 'Отправить'}
        </button>
      </form>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
