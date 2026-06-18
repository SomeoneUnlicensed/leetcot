'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@repo/auth/react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

// ──────────────────────────────────────────
// OTP input: 6 boxes, auto-advance, paste support
// ──────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, ch: string) => {
    const digit = ch.replace(/\D/g, '').slice(-1);
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = digit || ' ';
    const next = arr.join('').trimEnd();
    onChange(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="h-14 w-11 rounded-xl border border-zinc-700 bg-zinc-800 text-center text-2xl font-bold text-white caret-pink-500 outline-none ring-0 transition-all duration-150 focus:border-pink-500 focus:shadow-[0_0_12px_-2px_#ec4899aa] focus:ring-2 focus:ring-pink-500/30"
        />
      ))}
    </div>
  );
}

function ArlistButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await signIn('arlist', { callbackUrl: '/' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center gap-4 rounded-2xl bg-black px-5 py-3.5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm text-white"
        style={{ fontFamily: 'var(--font-dela)' }}
      >
        ID
      </span>
      <span className="text-[15px] font-semibold">
        {loading ? 'Переходим на Arlist...' : 'Зарегистрироваться через Arlist ID'}
      </span>
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-700" />
      <span className="text-xs text-zinc-500">или зарегистрируйся с паролем</span>
      <div className="h-px flex-1 bg-zinc-700" />
    </div>
  );
}

// ──────────────────────────────────────────
// Main page
// ──────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Step 1: register ──
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailVal = formData.get('email') as string;
    const passwordVal = formData.get('password') as string;
    const nameVal = formData.get('name') as string;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: passwordVal, name: nameVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Что-то пошло не так');

      setEmail(emailVal);
      setName(nameVal);
      setStep('verify');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify code ──
  const handleVerify = async () => {
    if (otp.replace(/\s/g, '').length < 6) {
      setError('Введи все 6 цифр кода');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp.replace(/\s/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Неверный код');
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: '__resend__', name }),
      });
      setResendCooldown(60);
      setOtp('');
    } catch {
      setError('Не удалось отправить код повторно');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="text-center">
          <pre className="mx-auto mb-4 text-[10px] font-bold leading-3 text-pink-500">
            {`
 /\\_/\\
( o.o )
 > ^ <
`}
          </pre>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {step === 'form' ? 'Регистрация в ЛитКот' : 'Подтверди email'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {step === 'form' ? (
              'Стань частью нашей кошачьей банды'
            ) : (
              <>
                Мы отправили 6-значный код на{' '}
                <span className="font-medium text-pink-400">{email}</span>
              </>
            )}
          </p>
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <>
            {/* Arlist ID — primary */}
            <div className="flex flex-col gap-2">
              <ArlistButton />
              <p className="text-center text-[11px] text-zinc-500">
                Рекомендуем — мгновенная регистрация через Arlist
              </p>
            </div>

            <Divider />

            {/* Credentials — secondary */}
            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="name" className="text-zinc-400">
                    Кошачье имя
                  </Label>
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
                  <Label htmlFor="email" className="text-zinc-400">
                    Email
                  </Label>
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
                  <Label htmlFor="password" className="text-zinc-400">
                    Пароль
                  </Label>
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
                <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 py-2 text-center text-sm text-pink-400">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-[0_0_20px_-5px_#db2777] transition-all duration-300 hover:bg-pink-700"
              >
                {loading ? 'Создаём профиль...' : 'Зарегистрироваться'}
              </Button>
            </form>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'verify' && (
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <OtpInput value={otp} onChange={setOtp} />

              {error ? (
                <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 py-2 text-center text-sm text-pink-400">
                  {error}
                </div>
              ) : null}

              <Button
                onClick={handleVerify}
                disabled={loading || otp.replace(/\s/g, '').length < 6}
                className="w-full rounded-xl bg-pink-600 py-3 font-bold text-white shadow-[0_0_20px_-5px_#db2777] transition-all duration-300 hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? 'Проверяем...' : 'Подтвердить'}
              </Button>
            </div>

            <div className="text-center text-sm text-zinc-500">
              Не получил письмо?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-medium text-pink-500 hover:text-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Отправить снова (${resendCooldown}с)` : 'Отправить снова'}
              </button>
            </div>
          </div>
        )}

        {/* Footer link */}
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
