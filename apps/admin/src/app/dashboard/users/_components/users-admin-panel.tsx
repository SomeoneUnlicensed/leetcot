'use client';

/* eslint-disable no-alert */

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import {
  banUser,
  deleteUnverifiedUsers,
  deleteUser,
  unbanUser,
  updateUserPassword,
  updateUserProfile,
  updateUserRoles,
  verifyUserEmail,
  type BannedUsers,
} from '../_actions';

interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  banned: number;
  activeSessions: number;
}

const ROLE_HINT = 'USER, ADMIN, TEACHER, STUDENT, MODERATOR, CREATOR, CONTRIBUTOR';

function formatDate(value: Date | string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function UserRow({ user }: { user: BannedUsers[0] }) {
  const roles = user.roles.map((role) => role.role);
  const hasLiveSession = user.sessions.length > 0;

  return (
    <tr className="border-b align-top last:border-b-0">
      <td className="min-w-64 px-3 py-4">
        <div className="font-medium">{user.name}</div>
        <div className="text-muted-foreground text-sm">{user.email}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge key={role} variant="secondary" className="rounded-md">
              {role}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="flex flex-col gap-1 text-sm">
          <span>{user.status === 'BANNED' ? 'Забанен' : 'Активен'}</span>
          <span className={user.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>
            {user.emailVerified ? 'Email подтвержден' : 'Email не подтвержден'}
          </span>
          <span className={hasLiveSession ? 'text-emerald-600' : 'text-muted-foreground'}>
            {hasLiveSession ? `Живых сессий: ${user.sessions.length}` : 'Живых DB-сессий нет'}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 text-sm">
        <div>Создан: {formatDate(user.createdAt)}</div>
        <div>Обновлен: {formatDate(user.updatedAt)}</div>
        <div className="text-muted-foreground mt-1">
          Посылки: {user._count.submission}, комменты: {user._count.comment}, задачи:{' '}
          {user._count.challenge}
        </div>
      </td>
      <td className="w-80 px-3 py-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const name = window.prompt('Новое имя:', user.name);
              if (name === null) return;
              const email = window.prompt('Новый email:', user.email);
              if (email === null) return;
              if (!window.confirm(`Сохранить изменения для ${user.email}?`)) return;
              const result = await updateUserProfile(user.id, { name, email });
              window.alert(result.message);
            }}
          >
            Изменить
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const password = window.prompt('Новый пароль:');
              if (!password) return;
              if (!window.confirm(`Сменить пароль пользователю ${user.email}?`)) return;
              const result = await updateUserPassword(user.id, password);
              window.alert(result.message);
            }}
          >
            Пароль
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const nextRoles = window.prompt(
                `Роли через запятую (${ROLE_HINT}):`,
                roles.join(', '),
              );
              if (nextRoles === null) return;
              if (!window.confirm(`Обновить роли для ${user.email}?`)) return;
              const result = await updateUserRoles(
                user.id,
                nextRoles
                  .split(',')
                  .map((role) => role.trim())
                  .filter(Boolean),
              );
              window.alert(result.message);
            }}
          >
            Роли
          </Button>
          {!user.emailVerified ? (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!window.confirm(`Подтвердить email ${user.email} вручную?`)) return;
                const result = await verifyUserEmail(user.id);
                window.alert(result.message);
              }}
            >
              Подтвердить
            </Button>
          ) : null}
          {user.status === 'BANNED' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!window.confirm(`Разбанить ${user.email}?`)) return;
                await unbanUser(user.id);
              }}
            >
              Разбан
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                const reason = window.prompt('Причина блокировки:', 'Ручная блокировка админом');
                if (reason === null) return;
                if (!window.confirm(`Забанить ${user.email}?`)) return;
                await banUser(user.id, null, reason);
              }}
            >
              Бан
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              if (!window.confirm(`Удалить ${user.email}? Это нельзя откатить.`)) return;
              const result = await deleteUser(user.id);
              window.alert(result.message);
            }}
          >
            Удалить
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function UsersAdminPanel({ users, stats }: { users: BannedUsers; stats: UserStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Пользователи</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Управление аккаунтами, ролями, паролями и ручным подтверждением.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {[
          ['Всего', stats.total],
          ['Подтверждены', stats.verified],
          ['Без email', stats.unverified],
          ['Забанены', stats.banned],
          ['DB-сессии', stats.activeSessions],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-2xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Аккаунты</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Удаление ограничено для пользователей с контентом, чтобы не оставить битые данные.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              className="max-w-72"
              placeholder="Поиск через Ctrl+F в браузере"
              aria-label="Поиск"
              disabled
            />
            <Button
              variant="outline"
              onClick={async () => {
                if (!window.confirm('Удалить всех неподтвержденных пользователей без контента?')) {
                  return;
                }
                const result = await deleteUnverifiedUsers();
                window.alert(result.message);
              }}
            >
              Очистить неподтвержденных
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-y">
              <tr>
                <th className="px-3 py-3 font-medium">Пользователь</th>
                <th className="px-3 py-3 font-medium">Статус</th>
                <th className="px-3 py-3 font-medium">Активность</th>
                <th className="px-3 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
