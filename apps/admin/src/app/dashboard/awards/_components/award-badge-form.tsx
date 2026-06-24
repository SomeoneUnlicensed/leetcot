'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { UserPicker, type PickerUser } from '../../_components/user-picker';
import { awardBadgeAction } from '../_actions';

interface Badge {
  name: string;
  slug: string;
}

const BADGES = [{ slug: 'contributor', name: 'Контрибьютер' }] as const;

export function AwardBadgeForm({
  badges = BADGES,
  users,
}: {
  badges?: readonly Badge[];
  users: PickerUser[];
}) {
  const [toUserId, setToUserId] = useState('');
  const [badgeSlug, setBadgeSlug] = useState<string>('contributor');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedBadge = badges.find((badge) => badge.slug === badgeSlug);
  const canSubmit = Boolean(toUserId) && !isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!toUserId) {
      setError('Пожалуйста, выберите пользователя');
      return;
    }

    startTransition(async () => {
      try {
        const result = await awardBadgeAction({ toUserId, badgeSlug });
        if (result.success) {
          setSuccess(true);
          setToUserId('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла непредвиденная ошибка');
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="space-y-6">
        {Boolean(success) && (
          <div role="status" className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 dark:bg-green-950/20 dark:text-green-400">
            Значок успешно выдан! 🎉
          </div>
        )}
        {Boolean(error) && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium leading-none">
            Значок
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {badges.map((badge) => {
              const isSelected = badge.slug === badgeSlug;

              return (
                <button
                  key={badge.slug}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setBadgeSlug(badge.slug)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/15 text-purple-100 ring-2 ring-purple-500/40'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900'
                  }`}
                >
                  {badge.name}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Выбран значок: {selectedBadge?.name ?? badgeSlug}
          </p>
        </div>

        <UserPicker
          label="Выберите пользователя"
          onChange={setToUserId}
          users={users}
          value={toUserId}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Выдание...' : 'Выдать значок'}
        </button>
      </form>
    </div>
  );
}
