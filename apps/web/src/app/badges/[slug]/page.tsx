import { notFound } from 'next/navigation';
import { prisma } from '@repo/db';
import Link from 'next/link';
import { getBadgeDefinition, BADGE_DEFINITIONS } from '~/lib/badge-definitions';
import { SlugToBadgeIcon } from '~/app/(profile)/[username]/_components/badges';

interface BadgePageParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BADGE_DEFINITIONS.map((b) => ({ slug: b.slug }));
}

export default async function BadgeDetailPage({ params }: BadgePageParams) {
  const { slug } = await params;
  const def = getBadgeDefinition(slug);
  if (!def) notFound();

  let count: number;
  if (slug === 'registered') {
    count = await prisma.user.count({ where: { status: 'ACTIVE' } });
  } else {
    count = await prisma.userBadge.count({ where: { badgeSlug: slug } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const Icon = SlugToBadgeIcon[slug as keyof typeof SlugToBadgeIcon];

  return (
    <div className="container mx-auto max-w-lg py-16">
      <div className="flex flex-col items-center gap-6 text-center">
        {Icon ? (
          <Icon className="h-32 w-32" />
        ) : (
          <div className="bg-muted h-32 w-32 rounded-full" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{def.name}</h1>
          <p className="text-muted-foreground mt-1 text-lg">{def.description}</p>
        </div>
        <p className="text-muted-foreground max-w-[40ch] leading-relaxed">
          {def.longDescription}
        </p>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium">Как получить</p>
          <p className="text-muted-foreground mt-1 text-sm">{def.howToEarn}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          {count} {count % 10 === 1 && count % 100 !== 11 ? 'пользователь' : 'пользователей'} получили этот значок
        </p>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Назад
        </Link>
      </div>
    </div>
  );
}
