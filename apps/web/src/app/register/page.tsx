'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Что-то пошло не так');
      }

      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <pre className="mx-auto mb-4 text-[10px] font-bold leading-3 text-pink-500">
            {`
 /\\_/\\
( o.o )
 > ^ <
`}
          </pre>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Регистрация в ЛитКот
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Стань частью нашей кошачьей банды</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Кошачье имя</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 border-zinc-700 bg-zinc-800 text-white"
                placeholder="Например, Барсик"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 border-zinc-700 bg-zinc-800 text-white"
                placeholder="meow@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 border-zinc-700 bg-zinc-800 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 py-2 text-center text-sm text-pink-500">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-[0_0_20px_-5px_#db2777] transition-all duration-300 hover:bg-pink-700"
          >
            {loading ? 'Создаем профиль...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-400">Уже есть аккаунт? </span>
          <Link href="/login" className="font-medium text-pink-500 hover:text-pink-400">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
