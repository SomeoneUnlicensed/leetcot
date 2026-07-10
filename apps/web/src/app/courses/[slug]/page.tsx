import type { Metadata } from 'next';
import { prisma } from '@repo/db';
import { notFound } from 'next/navigation';
import { buildMetaForDefault } from '~/app/metadata';
import { auth } from '~/server/auth';
import { Footsies } from '~/components/footsies';
import Link from 'next/link';
import { Badge } from '@repo/ui/components/badge';
import { EnrollCourseButton } from '../_components/enroll-course-button';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findFirst({ where: { slug } });
  if (!course) return buildMetaForDefault({ title: 'Курс не найден | ЛитКот' });
  return buildMetaForDefault({
    title: `${course.name} | ЛитКот`,
    description: course.description,
  });
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findFirst({
    where: { slug },
    include: {
      tracks: {
        include: {
          _count: {
            select: { trackChallenges: true, enrolledUsers: true },
          },
          trackChallenges: session?.user
            ? {
                orderBy: { orderId: 'asc' },
                include: {
                  challenge: {
                    select: {
                      id: true,
                      difficulty: true,
                      language: true,
                      name: true,
                      shortDescription: true,
                      slug: true,
                      status: true,
                      submission: {
                        where: {
                          userId: session.user.id,
                          isSuccessful: true,
                        },
                        select: {
                          id: true,
                          isSuccessful: true,
                        },
                        take: 1,
                      },
                    },
                  },
                },
              }
            : {
                orderBy: { orderId: 'asc' },
                include: {
                  challenge: {
                    select: {
                      id: true,
                      difficulty: true,
                      language: true,
                      name: true,
                      shortDescription: true,
                      slug: true,
                      status: true,
                    },
                  },
                },
              },
        },
        orderBy: { name: 'asc' },
      },
      _count: {
        select: { enrolledUsers: true },
      },
      enrolledUsers: session?.user
        ? {
            where: { id: session.user.id },
          }
        : false,
    },
  });

  if (!course) {
    notFound();
  }

  const isEnrolled = Array.isArray(course.enrolledUsers) && course.enrolledUsers.length > 0;

  const totalChallenges = course.tracks.reduce((acc, t) => acc + t._count.trackChallenges, 0);

  if (course.slug === 'oge-informatika-2026' || course.slug === 'oge-informatika-2027') {
    const year = course.slug === 'oge-informatika-2027' ? '2027' : '2026';
    const ogeModules = course.tracks.map((track) => {
      const lessonCount = track.trackChallenges.length;
      return { ...track, lessonCount };
    });

    const totalModules = ogeModules.length;

    return (
      <>
        <main className="overflow-hidden bg-gradient-to-b from-[#0f0c1a] to-[#1a1528] text-white">
          <div className="from-[#ec4899]/10 pointer-events-none fixed inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
          <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-[40rem] w-[50rem] rounded-l-full bg-[#8ef0de]/5 blur-3xl" />

          <section className="relative isolate border-b border-white/10 px-4">
            <div className="container relative grid min-h-[calc(100svh-3.5rem)] gap-10 py-20 md:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
                  ОГЭ {year} · подготовка
                </div>
                <h1
                  className="mt-7 max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
                  style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
                >
                  ОГЭ по информатике {year}
                </h1>
                <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
                  {year === '2027'
                    ? 'Расширенный курс подготовки: 4 раздела кодификатора, банк из 15–20 заданий на каждый номер КИМ, интерактивный тренажёр исполнителя «Робот», генераторы вариаций для систем счисления и логики, интеграция с code-runner для Python. ФИПИ 2027 — структура экзамена уточняется.'
                    : 'Полный курс подготовки: теория по кодификатору ФИПИ, банк заданий по всем номерам КИМ, тренажёр программирования на Python и пробные варианты с автоматической проверкой. 4 раздела, 16 заданий, максимум — 21 балл.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={ogeModules[0] ? `/oge/modules/${ogeModules[0].slug}` : '#'}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff8ecb] to-[#8ef0de] px-8 text-base font-black text-black transition hover:opacity-90"
                  >
                    Начать обучение
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 p-5 shadow-2xl shadow-black/30">
                <div className="ml-auto w-fit select-none font-mono text-sm font-black leading-5 text-[#ff8ecb]/55">
                  {`  _____   ____ _____ `}
                  <br />
                  {` /  _  \\ /  _ \\\\__  \\`}
                  <br />
                  {` |  |  ||  |_> / __ \\_`}
                  <br />
                  {` |  |  ||   __(____  _|`}
                  <br />
                  {` |  |__/ |  |       \\ \\`}
                  <br />
                  {` \\______/|__|   |___/_/`}
                </div>
                <div className="mt-7 grid gap-3">
                  {[
                    [`${totalModules}`, 'модулей курса'],
                    ['16', 'заданий КИМ'],
                    ['21', 'первичный балл'],
                    ['150', 'минут на экзамене'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <div className="font-mono text-2xl font-black text-[#8ef0de]">{value}</div>
                      <div className="mt-1 text-sm font-semibold text-[#d8d4df]/70">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-4 py-16">
            <div className="container">
              <p className="mb-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ef0de]">
                программа
              </p>
              <h2
                className="mx-auto max-w-3xl text-center text-3xl leading-tight md:text-4xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Четыре раздела кодификатора — от теории до практики
              </h2>
              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  [
                    'Цифровая грамотность',
                    'Файловая система, IP-адресация, поиск информации. Задания 7, 11, 12.',
                  ],
                  [
                    'Теоретические основы',
                    'Системы счисления, кодирование, логика, количество информации. 6 заданий.',
                  ],
                  [
                    'Алгоритмы и программирование',
                    'Алгоритмы, исполнители, Python, Робот. Задания 5, 6, 15, 16.',
                  ],
                  [
                    'Информационные технологии',
                    'Текст, таблицы, презентации, базы данных. Задания 9, 13, 14.',
                  ],
                ].map(([title, text]) => (
                  <div
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]"
                    key={title}
                  >
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-3 font-semibold leading-7 text-[#d8d4df]/65">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-16">
            <div className="container">
              <p className="mb-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ef0de]">
                модули
              </p>
              <h2
                className="text-center text-3xl leading-tight md:text-4xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                {totalModules} модулей для подготовки
              </h2>
              <div className="mt-10 grid gap-4 lg:grid-cols-2">
                {ogeModules.map((mod, i) => (
                  <Link
                    key={mod.slug}
                    href={`/oge/modules/${mod.slug}`}
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-[#8ef0de]">
                          {String(i + 1).padStart(2, '0')}
                        </p>
                        <h3 className="mt-3 text-2xl font-black text-white">{mod.name}</h3>
                      </div>
                    </div>
                    <p className="mt-4 font-semibold leading-7 text-[#d8d4df]/65">
                      {mod.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footsies />
      </>
    );
  }

  if (course.slug === 'golang-start') {
    const goChallenges = course.tracks.flatMap((track) =>
      track.trackChallenges.map((item) => item.challenge),
    );
    const difficultyLabels: Record<string, string> = {
      EASY: 'Легко',
      MEDIUM: 'Средне',
      HARD: 'Сложно',
      EXTREME: 'Экстрим',
      ULTRA: 'Ультра',
    };
    const difficultyClasses: Record<string, string> = {
      EASY: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
      MEDIUM: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
      HARD: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
      EXTREME: 'border-violet-300/30 bg-violet-300/10 text-violet-100',
      ULTRA:
        'border-white/15 bg-[linear-gradient(90deg,rgba(244,63,94,0.22),rgba(34,211,238,0.18),rgba(168,85,247,0.22))] text-fuchsia-50',
    };
    const challengeCountLabel = `${goChallenges.length} ${
      goChallenges.length % 10 === 1 && goChallenges.length % 100 !== 11 ? 'задача' : 'задач'
    }`;

    return (
      <>
        <main className="overflow-hidden bg-[#121018] text-white">
          <section className="relative isolate border-b border-white/10 px-4">
            <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
            <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[30rem] w-[34rem] rounded-r-full bg-[#f59e0b]/10 blur-3xl" />
            <div className="container relative grid min-h-[calc(100svh-3.5rem)] gap-10 py-20 md:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
                  Go · стартовый курс
                </div>
                <h1
                  className="mt-7 max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
                  style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
                >
                  Go для сервисных задач: функции, данные и проверки
                </h1>
                <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
                  Короткий курс для практики Go: слайсы, map, ошибки, сортировка, окна и графы.
                  Каждая задача открывается в редакторе и проверяется серверными тестами.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <EnrollCourseButton
                    courseId={course.id}
                    isEnrolled={isEnrolled}
                    isLoggedIn={Boolean(session?.user)}
                  />
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-base font-black text-white transition hover:bg-white/10"
                    href="/tracks/golang-service-start"
                  >
                    Открыть трек
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 p-5 shadow-2xl shadow-black/30">
                <pre className="ml-auto w-fit select-none font-mono text-sm font-black leading-5 text-[#ff8ecb]/55">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
                <div className="mt-7 grid gap-3">
                  {[
                    [challengeCountLabel, 'в курсе'],
                    ['Go', 'один язык'],
                    ['40', 'скрытых тестов на задачу'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <div className="font-mono text-2xl font-black text-[#8ef0de]">{value}</div>
                      <div className="mt-1 text-sm font-semibold text-[#d8d4df]/70">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-4 py-16">
            <div className="container">
              <p className="mb-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ef0de]">
                программа
              </p>
              <h2
                className="mx-auto max-w-3xl text-center text-3xl leading-tight md:text-4xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Курс идет от простых функций к задачам, похожим на backend-собеседование
              </h2>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  ['База Go', 'Функции, слайсы, map и аккуратная работа с данными.'],
                  [
                    'Ошибки и контракты',
                    'Возвращаем `error`, проверяем формат входа, не прячем сбои.',
                  ],
                  ['Алгоритмы в Go', 'Окна, сортировка, графы, приоритетная очередь и состояния.'],
                ].map(([title, text]) => (
                  <div
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]"
                    key={title}
                  >
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-3 font-semibold leading-7 text-[#d8d4df]/65">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-16">
            <div className="container">
              <p className="mb-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#8ef0de]">
                задачи курса
              </p>
              <h2
                className="text-center text-3xl leading-tight md:text-4xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                {challengeCountLabel} в курсе
              </h2>
              <div className="mt-10 grid gap-4 lg:grid-cols-2">
                {goChallenges.map((challenge, index) => (
                  <Link
                    className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:border-[#8ef0de]/35 hover:bg-white/[0.055]"
                    href={`/challenge/${challenge.slug}`}
                    key={challenge.slug}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-sm font-semibold text-[#8ef0de]">
                          {String(index + 1).padStart(2, '0')}
                        </p>
                        <h3 className="mt-3 text-2xl font-black text-white">{challenge.name}</h3>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                          difficultyClasses[challenge.difficulty] ?? 'border-white/10 text-white'
                        }`}
                      >
                        {difficultyLabels[challenge.difficulty] ?? challenge.difficulty}
                      </span>
                    </div>
                    <p className="mt-4 font-semibold leading-7 text-[#d8d4df]/65">
                      {challenge.shortDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footsies />
      </>
    );
  }

  return (
    <>
      <div className="container pb-8 pt-6 md:pt-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
                {course.name}
              </h1>
            </div>
            <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {course.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span>{course.tracks.length} треков</span>
              <span>·</span>
              <span>{totalChallenges} задач</span>
              <span>·</span>
              <span>{course._count.enrolledUsers} участников</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <EnrollCourseButton
              courseId={course.id}
              isEnrolled={isEnrolled}
              isLoggedIn={Boolean(session?.user)}
            />
          </div>
        </div>

        {/* Tracks list */}
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
          Треки в этом курсе
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {course.tracks.map((track) => {
            const completedCount = session?.user
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                track.trackChallenges.filter((tc: any) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tc.challenge?.submission?.some((s: any) => s.isSuccessful),
                ).length
              : 0;
            const totalCount = track._count.trackChallenges;
            const progressPct =
              totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Link key={track.id} href={`/tracks/${track.slug}`} className="group">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500">
                  <h3 className="mb-1 text-lg font-bold text-zinc-900 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                    {track.name}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {track.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{totalCount} задач</Badge>
                    {session?.user && totalCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footsies />
    </>
  );
}
