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
          'rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition duration-200 hover:bg-white/[0.08] hover:text-foreground dark:hover:bg-white/[0.08]',
          {
            'bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]':
              active,
          },
        )}
      >
        {title}
      </div>
    </Link>
  );
}
