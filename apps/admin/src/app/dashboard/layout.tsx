import { SidebarNav } from './_components/side-nav';
import type { SidebarNavIconKey } from './_components/side-nav';

export interface SidebarNavItem {
  href: string;
  icon: SidebarNavIconKey;
  title: string;
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    href: '/dashboard/reports',
    icon: 'flag',
    title: 'Репорты',
  },
  {
    href: '/dashboard/users',
    icon: 'users',
    title: 'Пользователи',
  },
  {
    href: '/dashboard/images',
    icon: 'shapes',
    title: 'Изображения',
  },
  {
    href: '/dashboard/tracks',
    icon: 'trophy',
    title: 'Треки',
  },
  {
    href: '/dashboard/championships',
    icon: 'medal',
    title: 'Чемпионаты',
  },
  {
    href: '/dashboard/notifications',
    icon: 'bell',
    title: 'Уведомления',
  },
  {
    href: '/dashboard/awards',
    icon: 'award',
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
