import Link from 'next/link';
import Image from 'next/image';

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

export function Footsies() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-zinc-900 bg-[#09090b] px-8 pb-12 pt-10 text-sm font-light text-zinc-300 sm:px-16 sm:pb-20 sm:pt-14 md:px-0 md:pb-16 md:pt-14">
      <div className="container flex flex-col-reverse justify-between gap-3 md:flex-row md:items-end">
        <div className="flex items-center gap-2">
          <span>Сделано с любовью</span>
          <a
            href="https://arlist.ru"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Image src="/arlist-logo.svg" alt="Arlist Tech Logo" width={24} height={24} />
            <span
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              className="text-pink-500 dark:text-fuchsia-400"
            >
              Arlist Tech
            </span>
          </a>
        </div>
        <Link
          href="/partners"
          className="bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text font-bold text-transparent outline-none ring-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-0"
        >
          Партнёрам
        </Link>
      </div>
      <div className="container flex flex-col justify-between gap-2 text-zinc-500 md:flex-row md:items-end">
        <span>
          <Link
            href="/privacy"
            className="transition-colors duration-300 hover:text-zinc-200 hover:underline"
          >
            Политика конфиденциальности
          </Link>{' '}
          |{' '}
          <Link
            href="/tos"
            className="transition-colors duration-300 hover:text-zinc-200 hover:underline"
          >
            Условия использования
          </Link>{' '}
          |{' '}
          <a
            href="mailto:hello@arlist.ru"
            className="transition-colors duration-300 hover:text-zinc-200 hover:underline"
          >
            hello@arlist.ru
          </a>
        </span>
        <span>
          <div className="inline-block rotate-180">©</div>
          {new Date().getFullYear()} ЛитКот · мяу{appVersion ? ` · ${appVersion}` : ''}
        </span>
      </div>
    </footer>
  );
}
