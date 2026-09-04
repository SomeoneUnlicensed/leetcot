import { SidebarNav } from '../../dashboard/_components/side-nav';

const hrNavItems = [
  { title: 'Обзор', href: '/dashboard/hr' },
  { title: 'Кандидаты', href: '/dashboard/hr/candidates' },
  { title: 'Воронка', href: '/dashboard/hr/pipeline' },
  { title: 'Задачи', href: '/dashboard/hr/tasks' },
  { title: 'Интервью', href: '/dashboard/hr/interviews' },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-7">
      <aside className="-mx-4 lg:w-1/5">
        <SidebarNav items={hrNavItems} />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
