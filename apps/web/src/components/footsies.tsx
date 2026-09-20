import Image from 'next/image';
import Link from 'next/link';

const linkClass = 'transition-colors hover:text-white hover:underline';

export function Footsies() {
  return (
    <footer className="flex flex-col items-center gap-5 bg-[#131722] px-6 pb-10 pt-10 text-center text-sm text-white/60">
      <Image
        src="/lentatech-logo-white.png"
        alt="Lenta tech"
        width={130}
        height={26}
        className="h-6 w-auto"
      />
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70">
        <Link href="/leaderboard/kiosk" className={linkClass}>
          Режим киоска
        </Link>
        <Link href="/admin/participants" className={linkClass}>
          Админка
        </Link>
        <Link href="/privacy" className={linkClass}>
          Политика конфиденциальности
        </Link>
        <Link href="/tos" className={linkClass}>
          Условия использования
        </Link>
      </nav>
      <div className="text-xs text-white/40">© {new Date().getFullYear()} Lenta tech</div>
    </footer>
  );
}
