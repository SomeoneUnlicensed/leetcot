import Image from 'next/image';

const RAY_FUND_URL = 'https://rayfund.ru/donate/?utm_source=leetcot';

interface RayFundNoteProps {
  text: string;
  className?: string;
  variant?: 'banner' | 'text';
}

export function RayFundNote({ text, className = '', variant = 'text' }: RayFundNoteProps) {
  if (variant === 'banner') {
    return (
      <a
        href={RAY_FUND_URL}
        target="_blank"
        rel="noreferrer"
        className={`block overflow-hidden rounded-2xl border border-zinc-800 transition-transform hover:scale-[1.01] ${className}`}
      >
        <Image
          src="/ray-fund-banner.png"
          alt="Фонд «РЭЙ» — мы хотим, чтобы животные были счастливы"
          width={1157}
          height={278}
          className="h-auto w-full"
        />
        <p className="bg-zinc-900/60 px-4 py-2 text-xs leading-5 text-zinc-400">{text}</p>
      </a>
    );
  }

  return (
    <a
      href={RAY_FUND_URL}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm leading-5 text-zinc-400 transition-colors hover:border-[#ffa249]/40 hover:text-zinc-200 ${className}`}
    >
      <span className="shrink-0 font-black text-[#ffa249]">фонд РЭЙ ·</span>
      {text}
    </a>
  );
}
