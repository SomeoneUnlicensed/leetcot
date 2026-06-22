'use client';
import { useSession } from '@repo/auth/react';
import { CheckCircle } from '@repo/ui/icons';
import { CodePanel } from '@repo/monaco';
import { useState } from 'react';
import { Confetti } from '~/components/confetti';
import { track as vercelTrack } from '@vercel/analytics';
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { EditorShortcutsButton } from '../_components/editor-shortcuts/editor-shortcuts-button';
import { FullscreenButton } from '../../../components/fullscreen-button';
import { ResetEditorButton } from '../_components/reset-editor-button';
import { SettingsButton } from '../_components/settings/settings-button';
import type { ChallengeRouteData } from './getChallengeRouteData';
import { SubmissionOverview } from './submissions/[[...catchAll]]/_components/overview';
import { saveSubmission } from './submissions/[[...catchAll]]/save-submission.action';
import SwapPanelButton from '../_components/swap-panel-button';
import { useQueryClient } from '@tanstack/react-query';

interface RightWrapperProps {
  challenge: ChallengeRouteData['challenge'];
  track: ChallengeRouteData['track'];
  nextChallenge: ChallengeRouteData['nextChallenge'];
  toggleDirection: () => void;
}

export function RightWrapper({
  track,
  challenge,
  nextChallenge,
  toggleDirection,
}: RightWrapperProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSelectedLayoutSegments();
  const { data: session } = useSession();
  const [showConfetti, setShowConfetti] = useState(false);

  if (!challenge) return null;

  if (segments[0] === 'submissions' && typeof segments[1] === 'string') {
    return <SubmissionOverview submissionId={segments[1]} userId={session?.user.id ?? ''} />;
  }

  // Redirect to solution on successful submission and show suggestions
  function handleSuccessfulSubmission(isSuccessful: boolean, submissionId: number, slug?: string) {
    const query = slug ? `&slug=${slug}` : '';
    if (isSuccessful) {
      router.push(`/challenge/${challenge.slug}/submissions/${submissionId}?success=true${query}`);
    }
  }

  if (challenge.isInfoOnly) {
    return (
      <div className="m-4 flex h-full min-h-[400px] select-none flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <pre className="mb-6 whitespace-pre text-center font-mono text-lg font-bold leading-relaxed text-zinc-700 md:text-xl dark:text-zinc-300">
          {`   /\\_/\\
  ( =.o=)  *мурр... это теория*
   > ^ <`}
        </pre>
        <h3 className="mb-2 text-center font-sans text-xl font-extrabold text-zinc-800 dark:text-zinc-100">
          Информационный раздел 🐾
        </h3>
        <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Внимательно ознакомьтесь с теоретическим материалом и примерами в левой панели. Когда вы
          будете готовы, нажмите кнопку ниже, чтобы зафиксировать выполнение.
        </p>
        <button
          disabled={!session?.user}
          onClick={async () => {
            vercelTrack?.('challenge-submitted', {
              success: true,
            });
            const submission = await saveSubmission({
              challenge,
              code: '',
              isSuccessful: true,
            });
            if (submission.isSuccessful) {
              queryClient.invalidateQueries({
                queryKey: ['challenge-solutions', challenge.slug],
              });
            }
            handleSuccessfulSubmission(submission.isSuccessful, submission.id, track?.slug);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-emerald-950/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!session?.user ? (
            <span>Войдите, чтобы отметить</span>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Отметить как выполненное</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      {showConfetti ? <Confetti /> : null}
      <CodePanel
        challenge={challenge}
        saveSubmission={async (code, isSuccessful) => {
          vercelTrack?.('challenge-submitted', {
            success: !isSuccessful,
          });

          const submission = await saveSubmission({
            challenge,
            code,
            isSuccessful,
          });

          if (submission.isSuccessful) {
            setShowConfetti(true);
            queryClient.invalidateQueries({
              queryKey: ['challenge-solutions', challenge.slug],
            });
          }

          return submission;
        }}
        submissionDisabled={!session?.user}
        settingsElement={<SettingsElements toggleDirection={toggleDirection} />}
        nextChallengeSlug={nextChallenge?.slug}
        nextChallengeName={nextChallenge?.name}
        trackSlug={track?.slug}
      />
    </>
  );
}

interface SettingsElementsProps {
  toggleDirection: () => void;
}

function SettingsElements({ toggleDirection }: SettingsElementsProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/40 p-0.5 shadow-inner backdrop-blur-sm">
      <ResetEditorButton />
      <EditorShortcutsButton />
      <SettingsButton />
      <SwapPanelButton toggleDirection={toggleDirection} />
      <FullscreenButton />
    </div>
  );
}
