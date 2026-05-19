'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@repo/auth/react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess(
        'Привет! Я ЛитКот. Мы очень мяв рады видеть тебя в нашей банде! Твой профиль уже прогрет и готов к приключениям. Давай теперь войдем?',
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Неправильный email или пароль. Кот недоволен.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Что-то пошло не так. Попробуй еще раз.');
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
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Вход в ЛитКот</h2>
          <p className="mt-2 text-sm text-zinc-400">С возвращением в нашу кошачью банду</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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

          {error && (
            <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 py-2 text-center text-sm text-pink-500">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 py-2 text-center text-sm text-green-500">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-[0_0_20px_-5px_#db2777] transition-all duration-300 hover:bg-pink-700"
          >
            {loading ? 'Заходим...' : 'Войти'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-400">Нет аккаунта? </span>
          <Link href="/register" className="font-medium text-pink-500 hover:text-pink-400">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
