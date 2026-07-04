'use client';
import { type ReactNode, useEffect, useState } from 'react';
import type { ChallengeRouteData } from '../[slug]/getChallengeRouteData';
import { LeftWrapper } from '../[slug]/left-wrapper';
import { RightWrapper } from '../[slug]/right-wrapper';
import { useChallengeRouteData } from '../[slug]/challenge-route-data.hook';
import { PracticeWorkspace } from '~/components/practice-kit';

interface ChallengeLayoutWrapperProps {
  challenge: ChallengeRouteData['challenge'];
  track: ChallengeRouteData['track'];
  nextChallenge: ChallengeRouteData['nextChallenge'];
  children: ReactNode;
}

export function ChallengeLayoutWrapper({
  challenge,
  track,
  nextChallenge,
  children,
}: ChallengeLayoutWrapperProps) {
  const { setCurrentChallenge } = useChallengeRouteData();

  useEffect(() => {
    setCurrentChallenge(challenge);
  }, [challenge, setCurrentChallenge]);

  const [isReversed, setIsReversed] = useState(false);

  const toggleDirection = () => {
    setIsReversed((prev) => !prev);
  };

  return (
    <PracticeWorkspace
      isReversed={isReversed}
      left={({ expandPanel, isDesktop }) => (
        <LeftWrapper
          challenge={challenge}
          track={track}
          expandPanel={expandPanel}
          isDesktop={isDesktop}
        >
          {children}
        </LeftWrapper>
      )}
      right={
        <RightWrapper
          track={track}
          challenge={challenge}
          nextChallenge={nextChallenge}
          toggleDirection={toggleDirection}
        />
      }
    />
  );
}
