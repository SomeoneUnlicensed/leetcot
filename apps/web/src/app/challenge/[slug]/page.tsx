import { type Session } from '@repo/auth/server';
import { buildMetaForChallenge } from '~/app/metadata';
import { auth } from '~/server/auth';
import { getRelativeTimeStrict } from '~/utils/relativeTime';
import { Comments } from '../_components/comments';
import { Description } from '../_components/description';
import { getChallengeRouteData } from './getChallengeRouteData';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;

  const { challenge } = await getChallengeRouteData(slug, null);
  const description = `Unlock your coding potential by solving the ${challenge.name} challenge on ЛитКот.`;
    return buildMetaForChallenge({
      title: `${challenge.name} | ЛитКот`,
      description,
    username: challenge.user.name,
    difficulty: challenge.difficulty,
    date: getRelativeTimeStrict(challenge.createdAt),
  });
}

export default async function Challenges({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await auth();

  const { challenge } = await getChallengeRouteData(slug, session);

  return (
    <div className="relative h-full ">
      <Description challenge={challenge} />
      <Comments root={challenge} type="CHALLENGE" />
    </div>
  );
}

export function isAuthor(session: Session | null, userId?: string | null) {
  return userId && session?.user?.id && userId === session?.user?.id;
}
