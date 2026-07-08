import type { Metadata } from 'next';
import { Suspense, use } from 'react';
import { buildMetaForDefault } from '~/app/metadata';
import { ExploreSlug } from '../_components/explore-slug';
import { ExploreSlugSkeleton } from '../_components/explore-slug-skeleton';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Каталог задач',
    description: 'Подборка задач ЛитКота по языку, сложности или теме.',
  });
}

// accepts both difficulty & tags as slug.
// ex: `/explore/easy`, `explore/popular`
export default function Page({ params }: { params: Params }) {
  const { slug } = use(params);

  return (
    <Suspense fallback={<ExploreSlugSkeleton />}>
      <ExploreSlug slug={slug} />
    </Suspense>
  );
}
