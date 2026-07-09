'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`));

  return (
    <Link className="block" href={href}>
      <div
        className={clsx(
          'text-muted-foreground hover:text-foreground relative overflow-hidden rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/0 before:transition-colors before:duration-200 hover:bg-white/[0.08] hover:before:bg-white/20 dark:hover:bg-white/[0.08]',
          {
            'text-foreground bg-white/[0.11] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] before:bg-white/30':
              active,
          },
        )}
      >
        {title}
      </div>
    </Link>
  );
}
