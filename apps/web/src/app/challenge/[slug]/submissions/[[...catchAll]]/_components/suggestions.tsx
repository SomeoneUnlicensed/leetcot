'use client';
import { Button } from '@repo/ui/components/button';
import { ChevronRight, Swords } from '@repo/ui/icons';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import { TrackChallenge } from '~/app/tracks/_components/track-challenge-card';
import { getTrackDetails } from '~/app/tracks/_components/track.action';
import { getSimilarChallenges } from '~/utils/server/get-similar-challenges';

interface SuggestionsProps {
  track: string | null;
  challengeId: number;
}

export function Suggestions({ track, challengeId }: SuggestionsProps) {
  // Get challenges in current track
  const { data: trackDetails } = useQuery({
    queryKey: ['track-details', track],
    queryFn: () => {
      return getTrackDetails(track!);
    },
    enabled: Boolean(track),
  });

  // Get suggested challenges
  const { data: similarChallenges } = useQuery({
    queryKey: ['similar-challenges', challengeId],
    queryFn: () => {
      return getSimilarChallenges(challengeId);
    },
  });

  const currentIndex = useMemo(() => {
    if (trackDetails === null || trackDetails === undefined) return null;

    const index = trackDetails.trackChallenges.findIndex((x) => x.challengeId === challengeId);
    return index === -1 ? null : index;
  }, [trackDetails, challengeId]);

  // Get next challenge in Track
  const next = useMemo(() => {
    if (currentIndex === null) return null;

    const index = Number(currentIndex) + 1;
    return index < trackDetails!.trackChallenges.length
      ? trackDetails!.trackChallenges[index]
      : null;
  }, [currentIndex, trackDetails]);

  const nextChallenge = useMemo(() => {
    if (trackDetails && next) {
      return {
        slug: next.challenge.slug,
        name: next.challenge.name,
        query: `?slug=${track}`,
      };
    }
    if (similarChallenges && similarChallenges.length > 0) {
      const first = similarChallenges[0];
      if (first) {
        return {
          slug: first.slug,
          name: first.name,
          query: '',
        };
      }
    }
    return null;
  }, [trackDetails, next, similarChallenges, track]);

  return (
    <div className="w-full max-w-[1000px] md:py-4 md:pb-8">
      {nextChallenge ? (
        <div className="mb-6 px-3">
          <Link href={`/challenge/${nextChallenge.slug}${nextChallenge.query}`}>
            <Button className="group flex h-auto w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all duration-300 hover:from-fuchsia-400 hover:via-pink-400 hover:to-violet-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] active:scale-[0.98]">
              <span>Следующая задача: {nextChallenge.name}</span>
              <ChevronRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </Link>
        </div>
      ) : null}

      {trackDetails && next ? (
        <>
          <div className="flex items-center justify-between p-3">
            <h3 className="text-foreground/70 flex items-center gap-2 text-lg font-semibold md:text-xl">
              <Swords size={26} />
              {`Следующее в ${trackDetails?.name}`}
            </h3>
            <Link href={`/tracks/${track}`}>
              <Button size="sm" className="gap-1 rounded-full" variant="outline">
                Больше <ChevronRight size={13} />
              </Button>
            </Link>
          </div>
          <div className="px-3">
            <Link href={`/challenge/${next.challenge.slug}`}>
              <TrackChallenge
                challenge={next.challenge}
                isInProgress={false}
                hideSubmissionStatus
                isCompleted={false}
              />
            </Link>
          </div>
        </>
      ) : null}

      {similarChallenges ? (
        <>
          <div className="flex items-center justify-between p-3">
            <h3 className="text-foreground/70 text-lg font-semibold md:text-xl">
              Больше испытаний
            </h3>
            <Link href="/explore">
              <Button size="sm" className="gap-1 rounded-full" variant="outline">
                Исследовать <ChevronRight size={13} />
              </Button>
            </Link>
          </div>
          <div className="px-3">
            {similarChallenges?.map((challenge, idx) => {
              return (
                <Link href={`/challenge/${challenge.slug}`} key={idx}>
                  <TrackChallenge
                    challenge={{ ...challenge, submission: [] }}
                    hideSubmissionStatus
                    isCompleted={false}
                    isInProgress={false}
                  />
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
