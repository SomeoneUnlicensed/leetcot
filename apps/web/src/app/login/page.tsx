'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from '@repo/auth/react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('callbackUrl') ?? '/';

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Готово! Теперь можно войти.');
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
        setError('Неправильный email или пароль.');
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('Что-то пошло не так. Попробуй еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="border-border w-full max-w-md space-y-6 rounded-2xl border bg-white p-8 shadow-xl">
        <div className="text-center">
          <Image
            src="/lentatech-logo-color.png"
            alt="Lenta tech"
            width={150}
            height={30}
            className="mx-auto mb-6 h-7 w-auto"
          />
          <h2 className="text-2xl font-bold text-[#131722]">Вход в Дебаг-Симулятор</h2>
          <p className="mt-2 text-sm text-[#131722]/60">Только для приглашённых участников</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="email" className="text-[#131722]/70">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="border-border mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[#131722]/70">
                Пароль
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-border mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-center text-sm text-emerald-600">
              {success}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00A0FF] py-3 font-bold text-white hover:bg-[#0090e6]"
          >
            {loading ? 'Заходим...' : 'Войти'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-[#131722]/60">Нет аккаунта? </span>
          <Link href="/register" className="font-medium text-[#00A0FF] hover:text-[#0090e6]">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-[#131722]">
          Загрузка...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
