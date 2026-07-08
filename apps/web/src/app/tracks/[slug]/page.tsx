import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';

import { TrackDetail } from '../_components/track-details';
import { getTrackDetails } from '../_components/track.action';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  await auth();

  return <TrackDetail slug={slug} />;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const track = await getTrackDetails(slug);

  if (!track) {
    return buildMetaForDefault({
      title: 'Трек не найден',
      description: 'Такой трек обучения на ЛитКоте не найден.',
    });
  }

  return buildMetaForDefault({
    title: `${track.name} — трек обучения`,
    description: `${track.description} Практикуйтесь по шагам и сохраняйте прогресс на ЛитКоте.`,
  });
}
