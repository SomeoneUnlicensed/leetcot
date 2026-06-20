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
      <nav className="container flex h-14 items-center justify-between text-sm font-medium border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center space-x-3 select-none">
          <pre className="hidden text-[10px] font-bold leading-3 text-amber-500 sm:block">
            {`
 /\\_/\\
( o.o )
 > ^ <
`}
          </pre>
          <div
            className="text-xl leading-5 text-amber-500 tracking-wide font-extrabold"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            ЛитКот
            <span className="text-amber-500/60 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] align-middle ml-2 font-sans font-bold uppercase tracking-wider">
              Экзамены
            </span>
          </div>
        </div>
        <div className="text-zinc-400 font-medium select-none bg-zinc-900/60 border border-zinc-800/80 px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
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

