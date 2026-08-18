'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { signIn } from '@repo/auth/react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

function CodeLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('participant-code', { code, redirect: false });
      if (res?.error) {
        setError('Код не найден. Проверь и попробуй ещё раз.');
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="code" className="text-[#131722]/70">
          Код доступа
        </Label>
        <Input
          id="code"
          name="code"
          type="text"
          required
          autoFocus
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="border-border mt-1 text-center text-lg font-bold tracking-[0.3em]"
          placeholder="XXXXXXXX"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 py-2 text-center text-sm text-red-600">
          {error}
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
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setError('Неправильный email или пароль.');
      } else {
        router.push('/debug-simulator');
        router.refresh();
      }
    } catch {
      setError('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <Input name="email" type="email" required className="border-border" placeholder="Email" />
      <Input
        name="password"
        type="password"
        required
        className="border-border"
        placeholder="Пароль"
      />
      {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading}
        variant="outline"
        className="border-border w-full rounded-xl"
      >
        {loading ? 'Заходим...' : 'Войти как организатор'}
      </Button>
    </form>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [showAdmin, setShowAdmin] = useState(false);
  const redirectTo = searchParams.get('callbackUrl') ?? '/debug-simulator';

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
          <p className="mt-2 text-sm text-[#131722]/60">
            Введи код доступа, который тебе выдали организаторы
          </p>
        </div>

        <CodeLoginForm redirectTo={redirectTo} />

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setShowAdmin((v) => !v)}
            className="text-[#131722]/40 hover:text-[#131722]/70"
          >
            Я организатор
          </button>
        </div>

        {showAdmin ? (
          <div className="border-border border-t pt-6">
            <AdminLoginForm />
          </div>
        ) : null}
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
