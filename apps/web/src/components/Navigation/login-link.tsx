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
        'group relative inline-flex min-h-10 items-center justify-center overflow-hidden rounded-full border border-pink-200/35 bg-gradient-to-b from-pink-300/95 via-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_12px_30px_rgba(236,72,153,0.28)] transition duration-300 before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/60 after:absolute after:-left-8 after:top-0 after:h-full after:w-8 after:skew-x-[-18deg] after:bg-white/25 after:opacity-0 after:blur-sm after:transition-all after:duration-500 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.48),0_18px_38px_rgba(236,72,153,0.38)] hover:after:left-[120%] hover:after:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
        <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span>Вход</span>
      </div>
    </Link>
  );
}
