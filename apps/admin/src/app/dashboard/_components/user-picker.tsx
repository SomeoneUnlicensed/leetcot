'use client';

import { useMemo, useState } from 'react';

export interface PickerUser {
  id: string;
  name: string | null;
  email: string | null;
}

export function getUserLabel(user: PickerUser) {
  const name = user.name?.trim();
  const email = user.email?.trim();

  if (name && email) {
    return `${name} (${email})`;
  }

  return name || email || `Пользователь ${user.id.slice(0, 8)}`;
}

export function UserPicker({
  emptyText = 'Пользователей по этому запросу нет.',
  label,
  onChange,
  users,
  value,
}: {
  emptyText?: string;
  label: string;
  onChange: (userId: string) => void;
  users: PickerUser[];
  value: string;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleUsers = useMemo(
    () =>
      users.filter((user) =>
        getUserLabel(user).toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery, users],
  );
  const selectedUser = users.find((user) => user.id === value);

  return (
    <div className="space-y-2">
      <label htmlFor="userSearch" className="text-sm font-medium leading-none">
        {label} ({users.length})
      </label>
      <input
        id="userSearch"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по имени или почте"
        className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
      />
      <div
        role="listbox"
        aria-label={label}
        className="max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-2"
      >
        {visibleUsers.map((user) => {
          const isSelected = user.id === value;

          return (
            <button
              key={user.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onChange(user.id)}
              className={`mb-2 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition last:mb-0 ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-100 ring-1 ring-purple-500'
                  : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span className="min-w-0 truncate">{getUserLabel(user)}</span>
              {isSelected ? (
                <span className="shrink-0 text-xs font-semibold text-purple-200">
                  Выбран
                </span>
              ) : null}
            </button>
          );
        })}
        {visibleUsers.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {emptyText}
          </p>
        ) : null}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {selectedUser
          ? `Выбран пользователь: ${getUserLabel(selectedUser)}`
          : 'Пользователь не выбран'}
      </p>
    </div>
  );
}
