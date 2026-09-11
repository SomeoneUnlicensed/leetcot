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

interface LeaderboardListProps {
  block: 'BLOCK_1' | 'BLOCK_2' | null;
  initialParticipants: Participant[];
}

export function LeaderboardList({ block, initialParticipants }: LeaderboardListProps) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

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
        // Transient network hiccup on a screen nobody's watching closely — just retry next tick.
      }
    };

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [block]);

  if (participants.length === 0) {
    return (
      <div className="border-border rounded-2xl border bg-white p-8 text-center text-[#131722]/60">
        Пока никто не набрал очков.
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {participants.map((p, i) => (
        <li
          key={p.id}
          className="border-border flex items-center gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm"
        >
          <span className="w-8 shrink-0 text-center text-lg font-bold text-[#131722]/40">
            {MEDALS[i] ?? i + 1}
          </span>
          <UserAvatar src={p.image ?? ''} username={p.name} />
          <span className="min-w-0 flex-1 truncate font-semibold text-[#131722]">{p.name}</span>
          <span className="shrink-0 font-bold text-[#00A0FF]">{p.score} pts</span>
        </li>
      ))}
    </ol>
  );
}
