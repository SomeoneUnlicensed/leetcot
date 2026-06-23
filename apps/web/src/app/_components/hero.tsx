import { Compass, Play } from '@repo/ui/icons';
import Link from 'next/link';
import { Balancer } from 'react-wrap-balancer';
import { Button } from '@repo/ui/components/button';
import { HeroIllustration, BackgroundGrid } from './hero-illustration';
import { auth } from '~/server/auth';

function LeetCotLogo3D() {
  return (
    <pre className="mr-6 text-[14px] font-bold leading-4 text-pink-500 dark:text-fuchsia-400">
      {`
   |\\__/,|   (\`\\
 _.|o o  |_   ) )
-(((---(((--------
`}
    </pre>
  );
}
function BeamOfLight() {
  return (
    <svg
      className="animate-beam pointer-events-none absolute left-0 top-0 z-[-1] h-[169%] w-[138%] lg:w-[84%]"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter0_f_1065_8)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="#d946ef"
          fillOpacity="0.15"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_1065_8"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}

export async function Hero() {
  const session = await auth();
  return (
    <section className="pointer-events-none min-h-screen lg:min-h-0 lg:pt-[3.5rem] overflow-hidden">
      <div className="absolute inset-10 -z-30 overflow-hidden rounded-full opacity-70 lg:hidden">
        <BackgroundGrid />
      </div>
      <div className="container relative -mt-[3rem] grid min-h-screen items-center justify-center py-24 lg:min-h-0 lg:grid-cols-2 lg:py-0 [&>*]:pointer-events-auto">
        <BeamOfLight />
        <div className="flex w-full flex-col items-center justify-center gap-10 lg:items-start">
          <div className="relative flex w-full items-center justify-center gap-4 lg:justify-start">
            <div className="absolute left-1/2 top-1/2 -z-10 hidden h-56 w-56 -translate-x-[15%] -translate-y-[50%] rounded-full bg-pink-500/20 blur-3xl dark:block" />
            <div className="absolute right-1/2 top-1/2 -z-10 hidden h-56 w-56 -translate-y-[40%] rounded-full bg-fuchsia-600/20 blur-3xl dark:block" />
            <LeetCotLogo3D />
            <h1 className="animate-bg-gradient-to-center-title dark:to-69% select-none bg-gradient-to-br from-pink-500 from-[69%] to-black/0 bg-clip-text bg-right-bottom text-6xl font-extrabold text-transparent sm:text-8xl sm:leading-[5.5rem] dark:from-white dark:from-30% dark:via-pink-400 dark:to-fuchsia-600 dark:bg-[length:300%_300%]">
              <span className="font-dela-gothic font-black">ЛитКот</span>
            </h1>
          </div>

          <p className="max-w-[55ch] bg-transparent text-center font-medium leading-8 text-black/60 sm:px-8 lg:px-0 lg:text-left dark:text-white/50">
            <Balancer>
              Общайтесь, сотрудничайте и растите вместе с сообществом разработчиков. Повышайте свои
              навыки через интерактивные задачи с котиками, обсуждения и обмен знаниями. Мяу!
            </Balancer>
          </p>
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            <Button
              asChild
              className="hero-join-button-dark group relative mx-auto hidden w-fit overflow-hidden rounded-xl p-[1px] font-bold transition-all duration-300 md:mr-0 lg:mr-auto dark:block dark:hover:shadow-[0_0_2rem_-0.5rem_#d946ef88]"
              variant="outline"
            >
              <Link href="/explore">
                <span className="inline-flex h-full w-fit items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 dark:bg-neutral-900 dark:text-white group-hover:dark:bg-black">
                  <Compass className="h-4 w-4" />
                  {session ? 'Исследовать' : 'Начать обучение'}
                </span>
              </Link>
            </Button>
            <Button
              asChild
              className="group relative mx-auto flex w-fit overflow-hidden rounded-xl p-[1px] font-bold transition-all duration-300 md:ml-0 lg:ml-0"
              variant="ghost"
            >
              <Link href="/algorithms">
                <span className="inline-flex h-full w-fit items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 dark:text-pink-400 dark:hover:text-pink-300">
                  <Play className="h-4 w-4" />
                  Алгоритмы как рыбки
                </span>
              </Link>
            </Button>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
