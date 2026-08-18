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
          'text-muted-foreground hover:text-foreground relative overflow-hidden rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-black/[0.04]',
          {
            'text-primary bg-primary/10': active,
          },
        )}
      >
        {title}
      </div>
    </Link>
  );
}
