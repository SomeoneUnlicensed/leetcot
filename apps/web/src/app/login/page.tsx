'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { signIn } from '@repo/auth/react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

function ParticipantAuthForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !password || loading) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/participants/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Не удалось зарегистрироваться.');
          setLoading(false);
          return;
        }
      }

      const res = await signIn('participant-login', { name, password, redirect: false });
      if (res?.error) {
        setError(
          mode === 'register'
            ? 'Зарегистрировались, но не удалось войти. Попробуйте войти вручную.'
            : 'Неверные ФИО или пароль.',
        );
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
            mode === 'register'
              ? 'border-[#00A0FF] bg-[#00A0FF]/10 text-[#00A0FF]'
              : 'border-border text-[#131722]/50'
          }`}
        >
          Впервые здесь
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
            mode === 'login'
              ? 'border-[#00A0FF] bg-[#00A0FF]/10 text-[#00A0FF]'
              : 'border-border text-[#131722]/50'
          }`}
        >
          Уже регистрировался
        </button>
      </div>

      <div>
        <Label htmlFor="name" className="text-[#131722]/70">
          ФИО
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoFocus
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border mt-1"
          placeholder="Иван Иванов"
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
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-border mt-1"
          placeholder={mode === 'register' ? 'Придумайте пароль (от 6 символов)' : 'Ваш пароль'}
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
        {loading ? 'Секунду...' : mode === 'register' ? 'Зарегистрироваться и начать' : 'Войти'}
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
      <Button
        type="button"
        variant="outline"
        className="border-border w-full rounded-xl"
        onClick={() => signIn('github', { callbackUrl: '/panel' })}
      >
        Войти через GitHub
      </Button>
    </form>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [showAdmin, setShowAdmin] = useState(false);
  const redirectTo = searchParams.get('callbackUrl') ?? '/debug-simulator';
  const locked = searchParams.get('locked') === '1';

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
          <p className="mt-2 text-sm text-[#131722]/60">Введи ФИО и придумай пароль, чтобы начать</p>
        </div>

        {locked ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm text-amber-800">
            Организаторы завершили этот блок. Спасибо за участие!
          </div>
        ) : null}

        <ParticipantAuthForm redirectTo={redirectTo} />

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
