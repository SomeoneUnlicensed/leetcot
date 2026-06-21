'use client';

import { usePathname } from 'next/navigation';
import { useFullscreenSettingsStore } from '~/components/fullscreen-button';

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const { fssettings } = useFullscreenSettingsStore();
  const pathname = usePathname();

  if (fssettings.isFullscreen) return <></>;

  const isExamRoute = pathname?.startsWith('/exam');
  const isTeacherRoute = pathname?.startsWith('/teacher');

  if (isExamRoute || isTeacherRoute) {
    const headerTitle = isTeacherRoute ? 'Панель преподавателя' : 'Режим тестирования';
    return (
      <nav className="container flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 text-sm font-medium">
        <div className="flex select-none items-center space-x-3">
          <pre className="hidden text-[10px] font-bold leading-3 text-amber-500 sm:block">
            {`
 /\\_/\\
( o.o )
 > ^ <
`}
          </pre>
          <div
            className="text-xl font-extrabold leading-5 tracking-wide text-amber-500"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            ЛитКот
            <span className="ml-2 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 align-middle font-sans text-[10px] font-bold uppercase tracking-wider text-amber-500/60">
              Экзамены
            </span>
          </div>
        </div>
        <div className="flex select-none items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          {headerTitle}
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`flex h-14 items-center text-sm font-medium ${
        pathname?.startsWith('/challenge') ? 'px-4' : 'container'
      }`}
    >
      {children}
    </nav>
  );
}
