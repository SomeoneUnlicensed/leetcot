'use client';
import { useSession } from '@repo/auth/react';
import { CodePanel } from '@repo/monaco';
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
  toggleDirection: () => void;
}

export function RightWrapper({ track, challenge, toggleDirection }: RightWrapperProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const segments = useSelectedLayoutSegments();
  const { data: session } = useSession();

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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-zinc-50 dark:bg-zinc-950 p-8 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm m-4 select-none">
        <pre className="font-mono text-zinc-700 dark:text-zinc-300 text-lg md:text-xl font-bold leading-relaxed mb-6 whitespace-pre text-center">
{`   /\\_/\\
  ( =.o=)  *мурр... это теория*
   > ^ <`}
        </pre>
        <h3 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 text-center mb-2 font-sans">
          Информационный раздел 🐾
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-6 leading-relaxed">
          Внимательно ознакомьтесь с теоретическим материалом и примерами в левой панели.
          Когда вы будете готовы, нажмите кнопку ниже, чтобы зафиксировать выполнение.
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          <span>{!session?.user ? 'Войдите, чтобы отметить' : 'Отметить как выполненное 🐾'}</span>
        </button>
      </div>
    );
  }

  return (
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
          queryClient.invalidateQueries({
            queryKey: ['challenge-solutions', challenge.slug],
          });
        }

        return handleSuccessfulSubmission(submission.isSuccessful, submission.id, track?.slug);
      }}
      submissionDisabled={!session?.user}
      settingsElement={<SettingsElements toggleDirection={toggleDirection} />}
    />
  );
}

interface SettingsElementsProps {
  toggleDirection: () => void;
}

function SettingsElements({ toggleDirection }: SettingsElementsProps) {
  return (
    <>
      <ResetEditorButton />
      <EditorShortcutsButton />
      <SettingsButton />
      <SwapPanelButton toggleDirection={toggleDirection} />
      <FullscreenButton />
    </>
  );
}
