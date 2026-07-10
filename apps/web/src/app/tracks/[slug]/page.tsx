import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { buildMetaForDefault } from '~/app/metadata';

import { TrackDetail } from '../_components/track-details';
import { getTrackDetails } from '../_components/track.action';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const OGE_TRACK_SLUGS = [
  'oge-theory', 'oge-systems-num', 'oge-logic', 'oge-algo-prog', 'oge-it-tech',
  'oge-2027-digital-lit', 'oge-2027-theory', 'oge-2027-algo-prog', 'oge-2027-it',
];

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  await auth();

  // Redirect OGE tracks to the OGE module page
  if (OGE_TRACK_SLUGS.includes(slug)) {
    redirect(`/oge/modules/${slug}`);
  }

  return <TrackDetail slug={slug} />;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;

  if (OGE_TRACK_SLUGS.includes(slug)) {
    return buildMetaForDefault({
      title: 'Модуль ОГЭ Информатика',
      description: 'Модуль курса подготовки к ОГЭ по информатике 2026.',
    });
  }

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
