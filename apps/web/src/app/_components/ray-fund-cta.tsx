import { HeartHandshake } from '@repo/ui/icons';
import Image from 'next/image';

const RAY_FUND_URL = 'https://rayfund.ru/donate/?utm_source=leetcot';

export function RayFundCta() {
  return (
    <section className="border-t border-zinc-900 bg-[#09090b] px-4 py-20 text-white sm:py-24">
      <div className="container">
        <div className="grid gap-8 border-y border-zinc-900 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#ffa249]/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-[#ffa249]">
              <HeartHandshake className="h-4 w-4" />
              Социальный партнёр ЛитКота
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
              Решили задачу — помогите решить ещё одну
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
              Фонд «РЭЙ» помогает бездомным кошкам и собакам: приобретает корма, лекарства,
              оплачивает лечение и ищет животным любящую семью. Подержите работу фонда вместе с
              ЛитКотом!
            </p>
            <a
              href={RAY_FUND_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#ffa249] px-6 text-base font-black text-[#171a22] transition-transform hover:scale-[1.02]"
            >
              Помочь фонду «РЭЙ»
            </a>
          </div>

          <a
            href={RAY_FUND_URL}
            target="_blank"
            rel="noreferrer"
            className="block transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/ray-fund-badge.svg"
              alt="Фонд «РЭЙ» — помощь бездомным животным"
              width={235}
              height={74}
              className="h-auto w-full max-w-md"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
