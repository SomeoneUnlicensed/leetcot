'use client';
import { LogIn } from '@repo/ui/icons';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BLACKLISTED_LOGIN_REDIRECT_PATHS = ['/', '/login'];

export function LoginLink({ className }: { className?: string }) {
  const pathname = usePathname();
  const isBlacklistedPath = BLACKLISTED_LOGIN_REDIRECT_PATHS.some((blacklistedPath) => {
    return blacklistedPath === pathname;
  });
  return (
    <Link
      className={clsx(
        'focus-visible:ring-offset-background group relative inline-flex min-h-9 items-center justify-center overflow-hidden rounded-full border border-pink-200/25 bg-pink-400/[0.22] px-3.5 py-1.5 text-sm font-semibold text-pink-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_22px_rgba(236,72,153,0.16)] backdrop-blur-xl transition-colors duration-200 hover:border-pink-100/35 hover:bg-pink-400/[0.3] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-2',
        className,
      )}
      href={{
        pathname: '/login',
        query: {
          ...(!isBlacklistedPath && { redirectTo: pathname }),
        },
      }}
    >
      <div className="relative z-10 flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        <span>Вход</span>
      </div>
    </Link>
  );
}
