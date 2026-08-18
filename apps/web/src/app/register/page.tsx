'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    // Defer focus so React flushes the controlled value update first,
    // otherwise the browser reverts focus back to the current input.
    if (digit && i < 5) setTimeout(() => inputs.current[i + 1]?.focus(), 0);
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
          className="border-border h-14 w-11 rounded-xl border bg-white text-center text-2xl font-bold text-[#131722] caret-[#00A0FF] outline-none ring-0 transition-all duration-150 focus:border-[#00A0FF] focus:ring-2 focus:ring-[#00A0FF]/30"
        />
      ))}
    </div>
  );
}

async function readApiError(res: Response, fallback: string) {
  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return data?.error || fallback;
  }

  return fallback;
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
  const [pendingPassword, setPendingPassword] = useState('');
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
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Не удалось отправить код. Попробуй еще раз.'));
      }

      setEmail(emailVal);
      setName(nameVal);
      setPendingPassword(passwordVal);
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
    if (!email) {
      setError('Сначала зарегистрируйся или войди, пожалуйста.');
      setStep('form');
      return;
    }
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
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Неверный код'));
      }
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
    if (!email || !name || !pendingPassword) {
      setError('Сначала зарегистрируйся или войди, пожалуйста.');
      setStep('form');
      return;
    }
    setError(null);
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pendingPassword, name }),
      });
      setResendCooldown(60);
      setOtp('');
    } catch {
      setError('Не удалось отправить код повторно');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="border-border w-full max-w-md space-y-6 rounded-2xl border bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <Image
            src="/lentatech-logo-color.png"
            alt="Lenta tech"
            width={150}
            height={30}
            className="mx-auto mb-6 h-7 w-auto"
          />
          <h2 className="text-2xl font-bold text-[#131722]">
            {step === 'form' ? 'Регистрация' : 'Подтверди email'}
          </h2>
          <p className="mt-2 text-sm text-[#131722]/60">
            {step === 'form' ? (
              'Только по предрегистрации — email должен быть в списке приглашённых'
            ) : (
              <>
                Мы отправили 6-значный код на{' '}
                <span className="font-medium text-[#00A0FF]">{email}</span>
              </>
            )}
          </p>
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div className="flex flex-col gap-3">
              <div>
                <Label htmlFor="name" className="text-[#131722]/70">
                  Имя
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="border-border mt-1"
                  placeholder="Как к вам обращаться"
                />
              </div>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#00A0FF] py-3 font-bold text-white hover:bg-[#0090e6]"
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'verify' && (
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <OtpInput value={otp} onChange={setOtp} />

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 py-2 text-center text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <Button
                onClick={handleVerify}
                disabled={loading || otp.replace(/\s/g, '').length < 6}
                className="w-full rounded-xl bg-[#00A0FF] py-3 font-bold text-white hover:bg-[#0090e6] disabled:opacity-50"
              >
                {loading ? 'Проверяем...' : 'Подтвердить'}
              </Button>
            </div>

            <div className="text-center text-sm text-[#131722]/50">
              Не получил письмо?{' '}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-medium text-[#00A0FF] hover:text-[#0090e6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Отправить снова (${resendCooldown}с)` : 'Отправить снова'}
              </button>
            </div>
          </div>
        )}

        {/* Footer link */}
        <div className="text-center text-sm">
          <span className="text-[#131722]/60">Уже есть аккаунт? </span>
          <Link href="/login" className="font-medium text-[#00A0FF] hover:text-[#0090e6]">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
