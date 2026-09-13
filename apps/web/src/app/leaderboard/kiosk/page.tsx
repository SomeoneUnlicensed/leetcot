import type { Metadata } from 'next';
import { LENTA_CHAMPIONSHIP_SLUG, prisma } from '@repo/db';
import { KioskLeaderboard } from './_components/kiosk-leaderboard';

export const metadata: Metadata = {
  title: 'Лидерборд',
};

type EventBlock = 'BLOCK_1' | 'BLOCK_2';

interface PageProps {
  searchParams: { block?: string };
}

const BLOCK_LABELS: Record<EventBlock, string> = {
  BLOCK_1: 'Блок 1 · 12:40–13:20',
  BLOCK_2: 'Блок 2 · 17:45–19:00',
};

// Meant to be pointed at directly by an OBS browser source (no header, no nav, no
// interactive chrome) and projected full-screen at the venue — see NavWrapper,
// which hides the site nav specifically for this route.
export default async function LeaderboardKioskPage({ searchParams }: PageProps) {
  const block = searchParams.block === 'BLOCK_1' || searchParams.block === 'BLOCK_2' ? searchParams.block : null;

  const championship = await prisma.championship.findUnique({
    where: { slug: LENTA_CHAMPIONSHIP_SLUG },
  });

  const participants = championship
    ? await prisma.championshipParticipant.findMany({
        where: { championshipId: championship.id, archived: false, ...(block ? { eventBlock: block } : {}) },
        orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
        include: { user: { select: { name: true, image: true } } },
        take: 20,
      })
    : [];

  return (
    <KioskLeaderboard
      block={block}
      blockLabel={block ? BLOCK_LABELS[block] : null}
      initialParticipants={participants.map((p) => ({
        id: p.id,
        name: p.user.name,
        image: p.user.image,
        score: p.score,
      }))}
    />
  );
}
