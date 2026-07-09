import { RoleTypes } from '@repo/db/types';
import { Button } from '@repo/ui/components/button';
import { Lock, Shield } from '@repo/ui/icons';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';

export default async function DatabaseAdminPage() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/db');
  }

  const isAdmin = session.user.role.includes(RoleTypes.ADMIN);
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-pink-400" />
          <h1 className="mt-4 text-2xl font-bold">Доступ только для админа</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Эта страница открывает инструменты базы, поэтому сюда пускаем только роль ADMIN.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8">
        <Shield className="h-9 w-9 text-emerald-400" />
        <h1 className="mt-5 text-3xl font-bold">База данных</h1>
        <p className="mt-3 text-zinc-300">
          Ты вошел как админ. Прямой pgAdmin пока не подключен к `/db`: в production-кластере нет
          сервиса pgAdmin, а автологин к базе нельзя безопасно имитировать через пароль в браузере.
        </p>
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Безопасный план: поднять pgAdmin как внутренний ClusterIP-сервис, закрыть `/db` через
          nginx auth_request к админской сессии ЛитКота и только потом подключить webserver auth.
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/panel/dashboard/users">Открыть админку пользователей</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">На сайт</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
