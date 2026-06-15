import { ChallengeLayoutWrapper } from '~/app/challenge/_components/challenge-layout-wrapper';

import { ForceRenderUntilClient } from '@repo/ui/components/force-render-until-client';
import { auth } from '~/server/auth';

import { ContextProviders } from './context-providers';
import { getChallengeRouteData } from './getChallengeRouteData';
import { TrackVisibiltyProvider } from './use-track-visibility.hook';

export default async function LayoutData({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  const { challenge, track, nextChallenge } = await getChallengeRouteData(slug, session);

  return (
    <ForceRenderUntilClient>
      <ContextProviders>
        <TrackVisibiltyProvider>
          <ChallengeLayoutWrapper challenge={challenge} track={track} nextChallenge={nextChallenge}>
            {children}
          </ChallengeLayoutWrapper>
        </TrackVisibiltyProvider>
      </ContextProviders>
    </ForceRenderUntilClient>
  );
}
