import { SidebarNav } from './_components/side-nav';
import { Award, Bell, Flag, Medal, Shapes, Trophy, Users, type LucideIcon } from '@repo/ui/icons';

export interface SidebarNavItem {
  href: string;
  icon: LucideIcon;
  title: string;
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    href: '/dashboard/reports',
    icon: Flag,
    title: 'Репорты',
  },
  {
    href: '/dashboard/users',
    icon: Users,
    title: 'Пользователи',
  },
  {
    href: '/dashboard/images',
    icon: Shapes,
    title: 'Изображения',
  },
  {
    href: '/dashboard/tracks',
    icon: Trophy,
    title: 'Треки',
  },
  {
    href: '/dashboard/championships',
    icon: Medal,
    title: 'Чемпионаты',
  },
  {
    href: '/dashboard/notifications',
    icon: Bell,
    title: 'Уведомления',
  },
  {
    href: '/dashboard/awards',
    icon: Award,
    title: 'Награждение',
  },
];
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col gap-7 px-4 lg:flex-row">
      <aside className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:w-1/5 lg:overflow-visible lg:px-0">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}
