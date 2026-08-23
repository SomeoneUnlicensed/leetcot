'use client';

import { Flag } from '@repo/ui/icons';
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

  const mutedText = dark ? 'text-white/30' : 'text-[#131722]/40';

  if (solved) {
    return (
      <div className="flex items-center gap-3">
        <span className={cn('text-xs font-semibold tracking-wide uppercase', mutedText)}>Флаг</span>
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
            dark
              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          )}
        >
          <span className="font-semibold">Решено</span>
          <span className={dark ? 'text-emerald-400/70' : 'text-emerald-600/70'}>+{points} очков</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={cn('shrink-0 text-xs font-semibold tracking-wide uppercase', mutedText)}>Флаг</span>

      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex h-10 w-full max-w-sm min-w-0 items-stretch overflow-hidden rounded-lg border transition-colors',
          dark
            ? 'border-white/10 bg-white/5 focus-within:border-[#00A0FF]/60'
            : 'border-border bg-white focus-within:border-[#00A0FF]/60',
        )}
      >
        <span className={cn('flex items-center pl-3', mutedText)}>
          <Flag className="h-3.5 w-3.5" />
        </span>
        <input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="LENTA{...}"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-2.5 font-mono text-sm outline-none',
            dark ? 'text-white placeholder:text-white/25' : 'text-[#131722] placeholder:text-[#131722]/30',
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-[#00A0FF] px-4 text-sm font-bold text-white transition-colors hover:bg-[#0090e6] disabled:opacity-60"
        >
          {loading ? '...' : 'Отправить'}
        </button>
      </form>

      {error ? <span className={cn('text-xs', dark ? 'text-red-400' : 'text-red-500')}>{error}</span> : null}
    </div>
  );
}
