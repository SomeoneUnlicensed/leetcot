import { Button } from '@repo/ui/components/button';
import { ArrowUpRight, HeartHandshake, Mail } from '@repo/ui/icons';
import Link from 'next/link';

export function PartnerCta() {
  return (
    <section className="bg-[#f5efe5] px-4 py-20 text-[#171a22] sm:py-24">
      <div className="container">
        <div className="grid gap-8 border-y border-[#171a22]/15 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#171a22] px-4 py-2 text-sm font-black text-[#e9f6a8]">
              <HeartHandshake className="h-4 w-4" />
              для школ, компаний и сообществ
            </div>
            <h2 className="mt-5 max-w-2xl text-4xl font-black leading-none tracking-normal sm:text-6xl">
              Запартнёримся?
            </h2>
          </div>

          <div>
            <p className="max-w-2xl text-lg font-bold leading-8 text-[#34303a]/80">
              Соберём контест, учебный трек, SQL-практику или брендированный челлендж под вашу
              аудиторию: без скучной витрины, с задачами, которые правда хочется дорешать.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-2xl bg-[#171a22] px-6 text-base font-black text-white hover:bg-[#2b2633]"
              >
                <Link href="/partners">
                  Страница партнёрства
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-2xl border-[#171a22]/20 bg-white/40 px-6 text-base font-black text-[#171a22] hover:bg-white/70"
              >
                <a href="mailto:hello@arlist.ru">
                  <Mail className="mr-2 h-4 w-4" />
                  hello@arlist.ru
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
