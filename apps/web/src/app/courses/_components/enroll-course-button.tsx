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
      <Button
        disabled
        className="h-12 rounded-2xl bg-white/[0.08] px-6 text-base font-black text-[#d8d4df]"
      >
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
          className="h-12 rounded-2xl border-red-400/40 bg-white/[0.04] px-6 text-base font-black text-red-300 hover:bg-red-500/10"
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
        className="h-12 rounded-2xl bg-[#ff4fa3] px-6 text-base font-black text-white shadow-lg shadow-pink-950/30 transition-all hover:bg-[#ff75b9]"
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
