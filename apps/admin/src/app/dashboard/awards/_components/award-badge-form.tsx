'use client';

import { useState, useTransition } from 'react';
import { awardBadgeAction } from '../_actions';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Badge {
  name: string;
  slug: string;
}

const BADGES = [{ slug: 'contributor', name: 'Контрибьютер' }] as const;

function getUserLabel(user: User) {
  const name = user.name?.trim();
  const email = user.email?.trim();

  if (name && email) {
    return `${name} (${email})`;
  }

  return name || email || `Пользователь ${user.id.slice(0, 8)}`;
}

export function AwardBadgeForm({
  badges = BADGES,
  users,
}: {
  badges?: readonly Badge[];
  users: User[];
}) {
  const [toUserId, setToUserId] = useState('');
  const [badgeSlug, setBadgeSlug] = useState<string>('contributor');
  const [userQuery, setUserQuery] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedQuery = userQuery.trim().toLowerCase();
  const visibleUsers = users.filter((user) =>
    getUserLabel(user).toLowerCase().includes(normalizedQuery),
  );
  const selectedBadge = badges.find((badge) => badge.slug === badgeSlug);
  const selectedUser = users.find((user) => user.id === toUserId);

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

        <div className="space-y-2">
          <label htmlFor="userSearch" className="text-sm font-medium leading-none">
            Выберите пользователя ({users.length})
          </label>
          <input
            id="userSearch"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Поиск по имени или почте"
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          />
          <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2">
            {visibleUsers.map((user) => {
              const isSelected = user.id === toUserId;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setToUserId(user.id)}
                  className={`mb-2 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-100 ring-1 ring-purple-500'
                      : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span>{getUserLabel(user)}</span>
                  {isSelected ? (
                    <span className="text-xs font-semibold text-purple-200">Выбран</span>
                  ) : null}
                </button>
              );
            })}
            {visibleUsers.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Пользователей по этому запросу нет.
              </p>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {selectedUser ? `Выбран пользователь: ${getUserLabel(selectedUser)}` : 'Пользователь не выбран'}
          </p>
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
