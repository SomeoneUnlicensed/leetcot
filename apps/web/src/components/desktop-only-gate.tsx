import Image from 'next/image';

const RAY_FUND_URL = 'https://rayfund.ru/donate/?utm_source=leetcot';

export function DesktopOnlyGate() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-[#09090b] px-6 py-10 text-center md:hidden">
      <div className="m-auto flex flex-col items-center gap-6">
        <pre className="text-2xl font-bold leading-[1.15] text-pink-400">
          {`
 /\\_/\\
( o.o )
 > ^ <
`}
        </pre>
        <div>
          <h1 className="text-2xl font-black text-white">Пока только на компьютере</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-400">
            Мобильную версию ЛитКота ещё доделываем. Загляни с компьютера или ноутбука — там всё
            работает как надо.
          </p>
        </div>

        <div className="w-full max-w-xs rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <Image
            src="/ray-fund-logo.svg"
            alt="Фонд «РЭЙ»"
            width={88}
            height={50}
            className="mx-auto"
          />
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            А пока — помоги бездомным котам и собакам вместе с фондом «РЭЙ».
          </p>
          <a
            href={RAY_FUND_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#ffa249] px-5 text-sm font-black text-[#171a22]"
          >
            Помочь фонду «РЭЙ»
          </a>
        </div>
      </div>
    </div>
  );
}
