'use client';

import { GitBranch } from '@repo/ui/icons';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';
import { useInView } from 'react-intersection-observer';
import { contributors } from '../../../../public/contributors';
import styles from './community.module.css';
import { useEffect, useRef } from 'react';
import { Contributor } from './contributor';

// million-ignore
export function Community() {
  const innerScrollerRef = useRef<HTMLDivElement | null>(null);
  const innerScrollerRef2 = useRef<HTMLDivElement | null>(null);
  const innerScrollerRef3 = useRef<HTMLDivElement | null>(null);
  const innerScrollerRef4 = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (innerScrollerRef.current) {
      const scrollerContent = Array.from(innerScrollerRef.current.children) as HTMLElement[];
      scrollerContent.forEach((child) => {
        const duplicatedNode = child.cloneNode(true) as HTMLElement;
        duplicatedNode.setAttribute('aria-hidden', 'true');
        innerScrollerRef.current!.appendChild(duplicatedNode);
      });
    }
    if (innerScrollerRef2.current) {
      const scrollerContent = Array.from(innerScrollerRef2.current.children) as HTMLElement[];
      scrollerContent.forEach((child) => {
        const duplicatedNode = child.cloneNode(true) as HTMLElement;
        duplicatedNode.setAttribute('aria-hidden', 'true');
        innerScrollerRef2.current!.appendChild(duplicatedNode);
      });
    }
    if (innerScrollerRef3.current) {
      const scrollerContent = Array.from(innerScrollerRef3.current.children) as HTMLElement[];
      scrollerContent.forEach((child) => {
        const duplicatedNode = child.cloneNode(true) as HTMLElement;
        duplicatedNode.setAttribute('aria-hidden', 'true');
        innerScrollerRef3.current!.appendChild(duplicatedNode);
      });
    }
    if (innerScrollerRef4.current) {
      const scrollerContent = Array.from(innerScrollerRef4.current.children) as HTMLElement[];
      scrollerContent.forEach((child) => {
        const duplicatedNode = child.cloneNode(true) as HTMLElement;
        duplicatedNode.setAttribute('aria-hidden', 'true');
        innerScrollerRef4.current!.appendChild(duplicatedNode);
      });
    }
  }, []);

  type WrapperStyle = CSSProperties & {
    '--bottom': string;
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  return (
    <>
      <div className="lampcontainer -z-10 flex rotate-180 opacity-50 dark:opacity-100">
        <div
          className={clsx(
            { 'scale-[3] md:scale-[2] 2xl:scale-[1.55]': inView },
            'lamp translate-z-0 translate-y-[-180px] rotate-180 scale-50 animate-none duration-1000',
          )}
          ref={ref}
          style={
            {
              '--bottom': '#4188e6',
            } as WrapperStyle
          }
        />
      </div>
      {/* backdrop styles don't apply for the last pixel row of the elment for some reason no there's p and m offsets*/}
      <section className={clsx(styles.backdrop, 'relative -mb-[1px] pb-[1px]')}>
        <div className="backdrop-blur-md">
          <div className="container flex flex-col justify-center pt-[128px] lg:flex-row lg:items-center lg:pb-[148px]">
            <div className="flex flex-1 flex-col items-center gap-6 pb-12 lg:items-start lg:pb-0">
              <div className="rounded-full bg-gradient-to-r from-[#31bdc6] to-[#3178c6] p-[1px] brightness-90 contrast-150 dark:brightness-125 dark:contrast-100">
                <div className="rounded-full bg-white/80 px-3 py-1 dark:bg-black/80">
                  <span className="flex select-none items-center bg-gradient-to-r from-[#31bdc6] to-[#3178c6] bg-clip-text text-transparent">
                    <GitBranch className="h-4 w-4 stroke-[#31bdc6] stroke-2 sm:mr-2" />
                    <span className="hidden sm:block">От разработчиков для разработчиков</span>
                  </span>
                </div>
              </div>
              <h2 className="mt-2 text-center text-4xl font-bold lg:text-left">
                Создано сообществом
              </h2>
              <p className="max-w-[55ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 lg:text-left dark:text-white/50">
                ЛитКот — это бесплатный проект с открытым исходным кодом, созданный такими же
                разработчиками, как вы. Вот некоторые из контрибьюторов, благодаря которым это стало
                возможным.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://discord.gg/WjZhvVbFHM"
                  className="group mx-auto flex items-center gap-2 rounded-xl bg-neutral-200 px-3 py-2 text-sm font-bold duration-300 hover:bg-[#5865F2] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#5865F2]"
                >
                  <svg
                    className="h-4 w-4 fill-current group-hover:rotate-[360deg]"
                    role="img"
                    style={{ transition: 'color 0s, transform 0.3s' }}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Discord</title>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Вступить в Discord
                </a>
              </div>
            </div>
            {/* honeycomb grid */}
            <div className="hidden flex-1 pb-0 pl-6 xl:block">
              {/* xl width = w-16(4rem) * 8items  +  px-1.5(0.75rem) * 8paddings = 38rem */}
              <div className="honeycomboverride ml-auto flex flex-wrap xl:w-[38rem] ">
                {contributors.map((contributor) => (
                  <Contributor contributor={contributor} key={contributor.id} />
                ))}
              </div>
            </div>
            {/* autoscrolled */}
            <div className="pb-16 sm:pb-24 lg:pb-0 lg:pl-8 xl:hidden">
              <div className="infinite-scroll-x-container mx-auto hover:shadow-[0_0_10rem_10rem_#fff8] lg:w-[25rem] xl:w-[35rem] dark:hover:shadow-[0_0_10rem_10rem_#0008]">
                <div
                  ref={innerScrollerRef}
                  className="infinite-scroll-x relative flex w-max flex-nowrap py-1.5"
                >
                  {contributors.slice(0, contributors.length / 4).map((contributor) => (
                    <Contributor contributor={contributor} key={contributor.id} />
                  ))}
                </div>
              </div>
              <div className="infinite-scroll-x-container mx-auto hover:shadow-[0_0_10rem_10rem_#fff8] lg:w-[25rem] xl:w-[35rem] dark:hover:shadow-[0_0_10rem_10rem_#0008]">
                <div
                  ref={innerScrollerRef2}
                  className="infinite-scroll-x-reverse relative flex w-max flex-nowrap py-1.5"
                >
                  {contributors
                    .slice(contributors.length / 4, (contributors.length / 4) * 2)
                    .map((contributor) => (
                      <Contributor contributor={contributor} key={contributor.id} />
                    ))}
                </div>
              </div>
              <div className="infinite-scroll-x-container mx-auto hover:shadow-[0_0_10rem_10rem_#fff8] lg:w-[25rem] xl:w-[35rem] dark:hover:shadow-[0_0_10rem_10rem_#0008]">
                <div
                  ref={innerScrollerRef3}
                  className="infinite-scroll-x relative flex w-max flex-nowrap py-1.5"
                >
                  {contributors
                    .slice((contributors.length / 4) * 2, (contributors.length / 4) * 3)
                    .map((contributor) => (
                      <Contributor contributor={contributor} key={contributor.id} />
                    ))}
                </div>
              </div>
              <div className="infinite-scroll-x-container mx-auto hover:shadow-[0_0_10rem_10rem_#fff8] lg:w-[25rem] xl:w-[35rem] dark:hover:shadow-[0_0_10rem_10rem_#0008]">
                <div
                  ref={innerScrollerRef4}
                  className="infinite-scroll-x-reverse relative flex w-max flex-nowrap py-1.5"
                >
                  {contributors
                    .slice((contributors.length / 4) * 3, contributors.length)
                    .map((contributor) => (
                      <Contributor contributor={contributor} key={contributor.id} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
