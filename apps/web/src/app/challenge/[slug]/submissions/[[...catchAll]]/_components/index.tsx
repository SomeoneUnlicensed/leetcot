'use client';

import type { Submission } from '@repo/db/types';
import { Calendar, CheckCircle2, XCircle } from '@repo/ui/icons';
import clsx from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import NoSubmissions from './nosubmissions';
import { getRelativeTimeStrict } from '~/utils/relativeTime';
import type { ChallengeSubmissions } from '../page';
import { useParams } from 'next/navigation';

interface SubmissionsProps {
  submissions: ChallengeSubmissions;
}

type Status = 'accepted' | 'all' | 'rejected';
export function Submissions({ submissions }: SubmissionsProps) {
  const [selectedStatus, setSelectStatus] = useState<Status>('all');

  const filteredSubmissions = useMemo(() => {
    const predicate = (submission: Submission) => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'accepted') return submission.isSuccessful;
      return !submission.isSuccessful;
    };
    return submissions.filter(predicate);
  }, [selectedStatus, submissions]);
  return (
    <div className="relative h-full">
      {submissions.length !== 0 ? (
        <div className="bg-background/90 dark:bg-muted/90 absolute right-0 top-0 flex w-full gap-1 border-b border-zinc-300 p-2 px-3 backdrop-blur-sm dark:border-zinc-700">
          {(
            [
              ['all', 'Все'],
              ['accepted', 'Принято'],
              ['rejected', 'Отклонено'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={clsx(
                'rounded-md px-3 py-1 text-xs font-medium duration-150',
                selectedStatus === value
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800',
              )}
              onClick={() => setSelectStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <NoSubmissions />
      )}

      <ul className="custom-scrollable-element flex h-full flex-col divide-y divide-zinc-200 overflow-y-auto pt-12 dark:divide-zinc-800">
        {filteredSubmissions.map((submission) => {
          return <SubmissionRow key={submission.id} submission={submission} />;
        })}
      </ul>
    </div>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  const { slug } = useParams();
  const execTime = (submission as Submission & { executionTimeMs?: number | null }).executionTimeMs;
  return (
    <li className="cursor-pointer duration-150 hover:bg-neutral-100 dark:hover:bg-zinc-800/60">
      <Link className="flex items-center justify-between gap-3 px-4 py-2.5" href={`/challenge/${slug}/submissions/${submission.id}`}>
        <div
          className={clsx('flex items-center gap-1.5 text-sm font-medium', {
            'text-emerald-600 dark:text-emerald-400': submission.isSuccessful,
            'text-rose-600 dark:text-rose-400': !submission.isSuccessful,
          })}
        >
          {submission.isSuccessful ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {submission.isSuccessful ? 'Принято' : 'Отклонено'}
        </div>
        <div className="text-muted-foreground flex items-center gap-3">
          {submission.isSuccessful && execTime != null ? (
            <span className="font-mono text-xs">
              {execTime >= 1000 ? `${(execTime / 1000).toFixed(2)} с` : `${execTime} мс`}
            </span>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">{getRelativeTimeStrict(submission.createdAt)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

