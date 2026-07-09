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
          'relative overflow-hidden rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition duration-300 before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/0 before:transition-colors before:duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-foreground hover:shadow-[0_10px_24px_rgba(255,255,255,0.05)] hover:before:bg-white/25 dark:hover:bg-white/[0.08]',
          {
            'bg-white/[0.11] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.18)] before:bg-white/35':
              active,
          },
        )}
      >
        {title}
      </div>
    </Link>
  );
}
