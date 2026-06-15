'use client';

import { Button } from '@repo/ui/components/button';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { enrollUserInCourse, unenrollUserFromCourse } from './course.action';

interface EnrollCourseButtonProps {
  courseId: number;
  isEnrolled: boolean;
  isLoggedIn: boolean;
}

export function EnrollCourseButton({ courseId, isEnrolled, isLoggedIn }: EnrollCourseButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Button disabled className="rounded-xl bg-zinc-400 px-6 py-2 font-bold text-white">
        Войдите, чтобы записаться
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="outline"
          disabled={isPending}
          className="rounded-xl border-red-500/50 px-6 py-2 font-bold text-red-500 hover:bg-red-500/10"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await unenrollUserFromCourse(courseId);
              if (result) {
                setError(result);
              } else {
                router.refresh();
              }
            });
          }}
        >
          {isPending ? 'Отписываемся...' : 'Отписаться от курса'}
        </Button>
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={isPending}
        className="rounded-xl bg-emerald-600 px-8 py-3 font-extrabold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-emerald-950/20"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await enrollUserInCourse(courseId);
            if (result) {
              setError(result);
            } else {
              router.refresh();
            }
          });
        }}
      >
        {isPending ? 'Записываемся...' : 'Записаться на курс'}
      </Button>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
}
