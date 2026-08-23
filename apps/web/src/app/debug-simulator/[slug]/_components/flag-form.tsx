'use client';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
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

  if (solved) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm',
          dark
            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700',
        )}
      >
        <span className="font-semibold">Решено</span>
        <span className={dark ? 'text-emerald-400/70' : 'text-emerald-600/70'}>+{points} очков</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="LENTA{...}"
          className={cn(
            'h-10 text-sm focus-visible:ring-[#00A0FF]',
            dark
              ? 'border-white/10 bg-white/5 text-white placeholder:text-white/25'
              : 'border-border',
          )}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-10 shrink-0 bg-[#00A0FF] px-4 text-sm font-bold text-white hover:bg-[#0090e6]"
        >
          {loading ? '...' : 'Отправить'}
        </Button>
      </form>
      {error ? <p className={cn('text-xs', dark ? 'text-red-400' : 'text-red-500')}>{error}</p> : null}
    </div>
  );
}
