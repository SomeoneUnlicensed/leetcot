'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EventBlock = 'BLOCK_1' | 'BLOCK_2';

const BLOCK_LABELS: Record<EventBlock, string> = {
  BLOCK_1: 'Блок 1 (12:40–13:20)',
  BLOCK_2: 'Блок 2 (17:45–19:00)',
};

interface BlockControlsProps {
  initialActiveBlock: EventBlock | null;
}

export function BlockControls({ initialActiveBlock }: BlockControlsProps) {
  const router = useRouter();
  const [activeBlock, setActiveBlock] = useState<EventBlock | null>(initialActiveBlock);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);

  /** Destructive actions need a second click instead of a native confirm() dialog:
   * first click arms the button ("Точно?"), second click within the window runs it. */
  const runArmed = (key: string, action: () => void) => {
    if (armed !== key) {
      setArmed(key);
      setTimeout(() => setArmed((current) => (current === key ? null : current)), 4000);
      return;
    }
    setArmed(null);
    action();
  };

  const setRegistration = async (block: EventBlock | null) => {
    setLoading('registration');
    setMessage(null);
    try {
      const res = await fetch('/api/admin/championship', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeRegistrationBlock: block }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveBlock(data.activeRegistrationBlock);
        setMessage(block ? `Регистрация открыта: ${BLOCK_LABELS[block]}` : 'Регистрация закрыта.');
      }
    } finally {
      setLoading(null);
    }
  };

  const kick = async (block: EventBlock) => {
    setLoading(`kick-${block}`);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/participants/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block }),
      });
      const data = await res.json();
      if (res.ok)
        setMessage(
          `Сессии сброшены: ${data.kicked} участник(ов), остановлено окружений: ${data.environmentsStopped}.`,
        );
    } finally {
      setLoading(null);
    }
  };

  const archive = async (block: EventBlock) => {
    setLoading(`archive-${block}`);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/participants/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Заархивировано: ${data.archived} участник(ов).`);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-semibold text-[#131722]/70">Самостоятельная регистрация</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['BLOCK_1', 'BLOCK_2'] as const).map((block) => (
            <button
              key={block}
              type="button"
              disabled={loading === 'registration'}
              onClick={() => setRegistration(block)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                activeBlock === block
                  ? 'border-[#00A0FF] bg-[#00A0FF]/10 text-[#00A0FF]'
                  : 'border-border text-[#131722]/60 hover:text-[#131722]'
              }`}
            >
              Открыть: {BLOCK_LABELS[block]}
            </button>
          ))}
          <button
            type="button"
            disabled={loading === 'registration'}
            onClick={() => setRegistration(null)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              activeBlock === null
                ? 'border-red-400 bg-red-50 text-red-600'
                : 'border-border text-[#131722]/60 hover:text-[#131722]'
            }`}
          >
            Закрыть регистрацию
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[#131722]/45">
          Пока регистрация открыта на блок — новые участники на площадке сами заходят на сайт,
          вводят ФИО и придумывают пароль, попадают в этот блок автоматически.
        </p>
      </div>

      <div className="border-border grid gap-3 border-t pt-4 sm:grid-cols-2">
        {(['BLOCK_1', 'BLOCK_2'] as const).map((block) => (
          <div key={block} className="border-border rounded-xl border p-3">
            <p className="mb-2 text-sm font-bold text-[#131722]">{BLOCK_LABELS[block]}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading === `kick-${block}`}
                onClick={() => runArmed(`kick-${block}`, () => kick(block))}
                className={`border-border text-xs ${armed === `kick-${block}` ? 'border-red-400 bg-red-50 text-red-600' : ''}`}
              >
                {armed === `kick-${block}` ? 'Точно? Нажмите ещё раз' : 'Выбросить сессии'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading === `archive-${block}`}
                onClick={() => runArmed(`archive-${block}`, () => archive(block))}
                className={`text-xs ${
                  armed === `archive-${block}`
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                {armed === `archive-${block}` ? 'Точно? Нажмите ещё раз' : 'Архивировать блок'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="text-sm font-semibold text-emerald-600">{message}</p> : null}
    </div>
  );
}
