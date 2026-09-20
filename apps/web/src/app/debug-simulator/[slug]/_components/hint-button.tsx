'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HintButton({
  slug,
  next,
  total,
  penaltyPercent,
}: {
  slug: string;
  next: number;
  total: number;
  penaltyPercent: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/debug-tasks/${slug}/hint`, { method: 'POST' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Не удалось открыть подсказку.');
        return;
      }
      router.refresh();
    } catch {
      setError('Не удалось открыть подсказку.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={open}
        className="border-border w-full rounded-xl"
      >
        {loading ? 'Открываем...' : `Показать подсказку ${next} из ${total} (−${penaltyPercent}% очков)`}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
