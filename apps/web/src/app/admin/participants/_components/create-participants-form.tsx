'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EventBlock = 'BLOCK_1' | 'BLOCK_2';

interface CreatedParticipant {
  name: string;
  code: string;
}

export function CreateParticipantsForm() {
  const router = useRouter();
  const [namesText, setNamesText] = useState('');
  const [eventBlock, setEventBlock] = useState<EventBlock>('BLOCK_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedParticipant[] | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const names = namesText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0 || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names, eventBlock }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Не удалось создать участников.');
        return;
      }
      setCreated(data.created);
      setNamesText('');
      router.refresh();
    } catch {
      setError('Не удалось создать участников.');
    } finally {
      setLoading(false);
    }
  };

  const codesAsText = created?.map((c) => `${c.name}\t${c.code}`).join('\n') ?? '';

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-[#131722]/70">Блок мероприятия</span>
        <div className="flex gap-2">
          {(['BLOCK_1', 'BLOCK_2'] as const).map((block) => (
            <button
              key={block}
              type="button"
              onClick={() => setEventBlock(block)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                eventBlock === block
                  ? 'border-[#00A0FF] bg-[#00A0FF]/10 text-[#00A0FF]'
                  : 'border-border text-[#131722]/60 hover:text-[#131722]'
              }`}
            >
              {block === 'BLOCK_1' ? 'Блок 1 (12:40–13:20)' : 'Блок 2 (17:45–19:00)'}
            </button>
          ))}
        </div>

        <label htmlFor="names" className="text-sm font-semibold text-[#131722]/70">
          Имена участников (по одному на строку)
        </label>
        <textarea
          id="names"
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          rows={6}
          className="border-border w-full rounded-xl border p-3 font-mono text-sm"
          placeholder={'Иван Иванов\nПётр Петров'}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button
          type="submit"
          disabled={loading}
          className="w-fit bg-[#00A0FF] font-bold text-white hover:bg-[#0090e6]"
        >
          {loading ? 'Создаём...' : 'Создать коды доступа'}
        </Button>
      </form>

      {created ? (
        <div className="border-border rounded-xl border bg-[#F5F9FF] p-4">
          <p className="mb-2 text-sm font-semibold text-[#131722]">
            Готово! Раздайте коды участникам:
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-[#131722]">
            {codesAsText}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
