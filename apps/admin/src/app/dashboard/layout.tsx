import { SidebarNav } from './_components/side-nav';

const sidebarNavItems = [
  {
    title: 'Репорты',
    href: '/dashboard/reports',
  },
  {
    title: 'Пользователи',
    href: '/dashboard/users',
  },
  {
    title: 'Изображения',
    href: '/dashboard/images',
  },
  {
    title: 'Треки',
    href: '/dashboard/tracks',
  },
  {
    title: 'Бизнес',
    href: '/dashboard/business',
  },
  {
    title: 'Чемпионаты',
    href: '/dashboard/championships',
  },
];
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex gap-7 px-4">
      <aside className="-mx-4 lg:w-1/5">
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div className="flex-1">{children}</div>
    </main>
  );
}
