'use client';

import { UserAvatar } from '@repo/ui/components/user-avatar';
import { useEffect, useState } from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];
const POLL_MS = 4000;

interface Participant {
  id: string;
  name: string;
  image: string | null;
  score: number;
}

interface KioskLeaderboardProps {
  block: 'BLOCK_1' | 'BLOCK_2' | null;
  blockLabel: string | null;
  initialParticipants: Participant[];
}

export function KioskLeaderboard({ block, blockLabel, initialParticipants }: KioskLeaderboardProps) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    const query = block ? `?block=${block}` : '';
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/leaderboard${query}`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setParticipants(data.participants);
      } catch {
        // Screen nobody's babysitting closely — just retry next tick.
      }
    };

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [block]);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#05070c] bg-[radial-gradient(ellipse_at_top,rgba(0,160,255,0.10),transparent_55%)] px-10 py-8 text-white sm:px-16 sm:py-12">
      <header className="mb-8 flex shrink-0 items-center justify-between sm:mb-12">
        <div>
          <h1
            className="text-4xl font-bold tracking-tight sm:text-6xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Лидерборд
          </h1>
          {blockLabel ? <p className="mt-2 text-lg font-semibold text-white/40 sm:text-2xl">{blockLabel}</p> : null}
        </div>
        <span className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#00A0FF]/30 bg-[#00A0FF]/10 px-4 py-2 text-sm font-bold text-[#00A0FF] sm:px-5 sm:py-2.5 sm:text-base">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#00A0FF]" />
          LIVE
        </span>
      </header>

      {participants.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-2xl font-semibold text-white/30">
          Пока никто не набрал очков
        </div>
      ) : (
        <ol className="flex flex-1 flex-col gap-2.5 overflow-hidden sm:gap-3">
          {participants.map((p, i) => {
            const isTop3 = i < 3;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-5 rounded-2xl border px-6 py-3.5 transition-all duration-500 sm:gap-6 sm:px-8 sm:py-4 ${
                  isTop3
                    ? 'border-[#00A0FF]/25 bg-white/[0.06]'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span
                  className={`w-14 shrink-0 text-center font-bold sm:w-16 ${
                    isTop3 ? 'text-4xl sm:text-5xl' : 'text-2xl text-white/30 sm:text-3xl'
                  }`}
                >
                  {MEDALS[i] ?? i + 1}
                </span>
                <UserAvatar
                  src={p.image ?? ''}
                  username={p.name}
                  className={isTop3 ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-9 w-9 sm:h-11 sm:w-11'}
                />
                <span
                  className={`min-w-0 flex-1 truncate font-bold ${isTop3 ? 'text-2xl sm:text-3xl' : 'text-lg text-white/80 sm:text-xl'}`}
                >
                  {p.name}
                </span>
                <span
                  className={`shrink-0 font-bold text-[#00A0FF] ${isTop3 ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}
                >
                  {p.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
