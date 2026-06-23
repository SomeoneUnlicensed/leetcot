'use client';

import { useState, useTransition } from 'react';
import { awardBadgeAction } from '../_actions';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

const BADGES = [
  { slug: 'contributor', name: 'Контрибьютер' },
] as const;

export function AwardBadgeForm({ users }: { users: User[] }) {
  const [toUserId, setToUserId] = useState('');
  const [badgeSlug, setBadgeSlug] = useState<string>('contributor');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
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
          <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 dark:bg-green-950/20 dark:text-green-400">
            Значок успешно выдан! 🎉
          </div>
        )}
        {Boolean(error) && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Badge selector */}
        <div className="space-y-2">
          <label htmlFor="badgeSelect" className="text-sm font-medium leading-none">
            Значок
          </label>
          <select
            id="badgeSelect"
            value={badgeSlug}
            onChange={(e) => setBadgeSlug(e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {BADGES.map((b) => (
              <option key={b.slug} value={b.slug} className="dark:bg-zinc-900">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* User selector */}
        <div className="space-y-2">
          <label htmlFor="userSelect" className="text-sm font-medium leading-none">
            Выберите пользователя
          </label>
          <select
            id="userSelect"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="" className="dark:bg-zinc-900">
              -- Выберите из списка --
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="dark:bg-zinc-900">
                {u.name || 'Без имени'} ({u.email || 'Нет почты'})
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Выдание...' : 'Выдать значок'}
        </button>
      </form>
    </div>
  );
}
