'use client';

import { cn } from '@repo/ui/cn';
import { buttonVariants } from '@repo/ui/components/button';
import { Award, Bell, Flag, Medal, Shapes, Trophy, Users, type LucideIcon } from '@repo/ui/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SidebarNavItem } from '../layout';

export type SidebarNavIconKey = 'award' | 'bell' | 'flag' | 'medal' | 'shapes' | 'trophy' | 'users';

const sidebarIcons: Record<SidebarNavIconKey, LucideIcon> = {
  award: Award,
  bell: Bell,
  flag: Flag,
  medal: Medal,
  shapes: Shapes,
  trophy: Trophy,
  users: Users,
};

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Разделы админки"
      className={cn('flex min-w-max gap-2 lg:min-w-0 lg:flex-col lg:gap-1', className)}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname.includes(item.href);
        const Icon = sidebarIcons[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              isActive ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline',
              'shrink-0 justify-start gap-2',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
