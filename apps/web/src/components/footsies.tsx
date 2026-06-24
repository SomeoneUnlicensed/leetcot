import Link from 'next/link';
import Image from 'next/image';

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

export function Footsies() {
  return (
    <footer className="flex flex-col items-center gap-2 px-8 pb-12 text-sm font-light sm:px-16 sm:pb-20 sm:pt-6 md:px-0 md:py-12">
      <div className="container flex flex-col-reverse justify-between gap-2 md:flex-row md:items-end">
        <div className="flex items-center gap-2">
          <span>Сделано с любовью</span>
          <a
            href="https://arlist.tech"
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
      </div>
      <div className="container flex flex-col justify-between gap-2 text-neutral-500 md:flex-row  md:items-end dark:text-neutral-400">
        <span>
          <Link
            href="/privacy"
            className="dark:hover:text-primary-foreground transition-colors duration-300 hover:text-neutral-900 hover:underline"
          >
            Политика конфиденциальности
          </Link>{' '}
          |{' '}
          <Link
            href="/tos"
            className="dark:hover:text-primary-foreground transition-colors duration-300 hover:text-neutral-900 hover:underline"
          >
            Условия использования
          </Link>
        </span>
        <span>
          <div className="inline-block rotate-180">©</div>
          {new Date().getFullYear()} ЛитКот{appVersion ? ` · ${appVersion}` : ''}
        </span>
      </div>
    </footer>
  );
}
