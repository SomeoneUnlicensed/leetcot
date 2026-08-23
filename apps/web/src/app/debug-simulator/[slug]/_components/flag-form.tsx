'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FlagFormProps {
  slug: string;
  points: number;
  initiallySolved: boolean;
}

export function FlagForm({ slug, points, initiallySolved }: FlagFormProps) {
  const router = useRouter();
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [solved, setSolved] = useState(initiallySolved);
  const [error, setError] = useState<string | null>(null);

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
          className="shrink-0 text-sm font-bold text-[#00A0FF] transition-colors hover:text-[#0090e6] disabled:opacity-50"
        >
          {loading ? '...' : 'Отправить'}
        </button>
      </form>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
