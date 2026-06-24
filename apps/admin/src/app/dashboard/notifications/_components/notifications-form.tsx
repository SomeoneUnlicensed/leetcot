'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { UserPicker, type PickerUser } from '../../_components/user-picker';
import { sendNotificationAction } from '../_actions';

export function NotificationsForm({ users }: { users: PickerUser[] }) {
  const [targetType, setTargetType] = useState<'all' | 'user'>('all');
  const [toUserId, setToUserId] = useState<string>('');
  const [blurb, setBlurb] = useState('');
  const [url, setUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canSubmit = Boolean(blurb.trim()) && (targetType === 'all' || Boolean(toUserId)) && !isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!blurb.trim()) {
      setError('Пожалуйста, введите текст уведомления');
      return;
    }

    if (targetType === 'user' && !toUserId) {
      setError('Пожалуйста, выберите пользователя');
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendNotificationAction({
          targetType,
          toUserId: targetType === 'user' ? toUserId : undefined,
          blurb: blurb.trim(),
          url: url.trim(),
        });
        if (result.success) {
          setSuccess(true);
          setBlurb('');
          setUrl('');
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
            Уведомление успешно отправлено! 🎉
          </div>
        )}
        {Boolean(error) && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium leading-none">Кому отправить</p>
          <div className="flex gap-4">
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-normal">
              <input
                type="radio"
                name="targetType"
                checked={targetType === 'all'}
                onChange={() => {
                  setTargetType('all');
                  setToUserId('');
                }}
                className="h-4 w-4 border-zinc-300 text-purple-600 focus:ring-purple-600"
              />
              Всем активным пользователям
            </label>
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-normal">
              <input
                type="radio"
                name="targetType"
                checked={targetType === 'user'}
                onChange={() => setTargetType('user')}
                className="h-4 w-4 border-zinc-300 text-purple-600 focus:ring-purple-600"
              />
              Конкретному пользователю
            </label>
          </div>
        </div>

        {targetType === 'user' && (
          <UserPicker
            label="Выберите пользователя"
            onChange={setToUserId}
            users={users}
            value={toUserId}
          />
        )}

        <div className="space-y-2">
          <label htmlFor="blurb" className="text-sm font-medium leading-none">
            Текст уведомления
          </label>
          <textarea
            id="blurb"
            rows={4}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="Например: Добро пожаловать на платформу ЛитКот! Оставьте свой отзыв..."
            className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium leading-none">
            Ссылка (URL) при клике (необязательно)
          </label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Например: /explore или http://..."
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Отправка...' : 'Отправить уведомление'}
        </button>
      </form>
    </div>
  );
}
