import Image from 'next/image';
import Link from 'next/link';

export function Footsies() {
  return (
    <footer className="flex flex-col items-center gap-4 bg-[#131722] px-8 pb-10 pt-10 text-sm text-white/60 sm:px-16 md:px-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <Image src="/lentatech-logo-white.png" alt="Lenta tech" width={130} height={26} className="h-6 w-auto" />
        <div className="flex items-center gap-4 text-white/70">
          <Link href="/privacy" className="transition-colors hover:text-white hover:underline">
            Политика конфиденциальности
          </Link>
          <Link href="/tos" className="transition-colors hover:text-white hover:underline">
            Условия использования
          </Link>
        </div>
      </div>
      <div className="container text-center text-xs text-white/40 md:text-left">
        © {new Date().getFullYear()} Lenta tech
      </div>
    </footer>
  );
}
