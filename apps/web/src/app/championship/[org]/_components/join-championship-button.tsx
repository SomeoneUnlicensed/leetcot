'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Trophy } from '@repo/ui/icons';

interface JoinChampionshipButtonProps {
  championshipId: string;
}

export function JoinChampionshipButton({ championshipId }: JoinChampionshipButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/championship/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ championshipId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      } else {
        router.refresh();
      }
    } catch {
      setError('Ошибка при подключении к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        id="join-championship-btn"
        onClick={handleJoin}
        disabled={loading}
        className="flex items-center gap-2 bg-amber-500 px-8 py-3 text-lg font-bold text-black hover:bg-amber-400"
      >
        {loading ? (
          'Присоединяемся...'
        ) : (
          <>
            <Trophy className="h-5 w-5" /> Принять участие
          </>
        )}
      </Button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
