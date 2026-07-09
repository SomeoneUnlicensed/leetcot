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
        'group inline-flex min-h-10 items-center justify-center rounded-full border border-pink-400/35 bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_28px_rgba(236,72,153,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-pink-400 hover:shadow-[0_16px_34px_rgba(236,72,153,0.34)] focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      href={{
        pathname: '/login',
        query: {
          ...(!isBlacklistedPath && { redirectTo: pathname }),
        },
      }}
    >
      <div className="flex items-center gap-2">
        <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span>Вход</span>
      </div>
    </Link>
  );
}
