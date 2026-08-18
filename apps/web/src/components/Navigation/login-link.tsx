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
        'focus-visible:ring-offset-background group relative inline-flex min-h-9 items-center justify-center overflow-hidden rounded-full bg-[#00A0FF] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(0,160,255,0.28)] transition-colors duration-200 hover:bg-[#0090e6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A0FF] focus-visible:ring-offset-2',
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
