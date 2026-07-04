import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  Building2,
  Check,
  ClipboardCheck,
  GraduationCap,
  Laptop,
  Tag,
  Trophy,
} from '@repo/ui/icons';
import { Button } from '@repo/ui/components/button';
import { Footsies } from '~/components/footsies';

export const metadata: Metadata = {
  title: 'Партнёрам | ЛитКот',
  description:
    'Leetcot — платформа для coding challenges, технических отборов и учебных треков под бренд партнёра.',
};

const stack = [
  'Код',
  'SQL-практика',
  'Python',
  'TypeScript',
  'JavaScript',
  'Go',
  'Java',
  'Rust',
  'C++',
  'Kotlin',
  'Ruby',
  'PHP',
  'Swift',
  'PostgreSQL',
  'Docker',
  'Node.js',
];

const audiences = [
  {
    icon: Building2,
    title: 'Компании и DevRel',
    text: 'Публичные и приватные coding challenges под бренд компании.',
  },
  {
    icon: ClipboardCheck,
    title: 'HR и технический найм',
    text: 'Тестовые наборы задач для первичной оценки кандидатов.',
  },
  {
    icon: GraduationCap,
    title: 'Университеты и школы',
    text: 'Практические треки по коду, SQL и отдельным темам для студентов и школьников.',
  },
  {
    icon: Laptop,
    title: 'Онлайн-образование',
    text: 'Домашние задания, тренажёры и автопроверка практических задач.',
  },
];

const products = [
  {
    icon: Trophy,
    name: 'Leetcot Challenges',
    tagline: 'Брендированные coding challenges и контесты',
    description:
      'Запускайте отдельные челленджи под бренд компании, университета или сообщества: задачи, рейтинг, страница события и итоговые результаты.',
    items: [
      'отдельная страница челленджа',
      'задачи по коду с выбранным языком решения',
      'отдельные SQL-задачи с таблицами и запросами',
      'разные уровни сложности',
      'рейтинг участников',
      'итоговая таблица результатов',
      'короткий отчёт по итогам',
    ],
    examples: ['SQL Challenge', 'Algorithms Cup', 'Python Warmup', 'Full-stack Challenge'],
    featured: false,
  },
  {
    icon: ClipboardCheck,
    name: 'Leetcot Screening',
    tagline: 'Техническая оценка кандидатов',
    description:
      'Leetcot можно использовать как инструмент для первичной проверки навыков кандидатов: отдельно SQL, отдельно алгоритмы и задачи по коду на нужном языке.',
    items: [
      'приватную ссылку на тест',
      'набор задач под уровень кандидата',
      'результаты участников',
      'рейтинг',
      'решения и попытки',
      'выгрузку результатов',
    ],
    examples: ['junior-разработчики', 'middle-разработчики', 'SQL-аналитики', 'стажёры'],
    featured: false,
  },
  {
    icon: GraduationCap,
    name: 'Leetcot Education',
    tagline: 'Учебные треки и практикумы',
    description:
      'На базе Leetcot можно запускать образовательные треки для студентов, школьников, сотрудников или слушателей курсов.',
    items: [
      'набор задач',
      'прогресс участников',
      'рейтинг',
      'итоговую таблицу',
      'адаптацию трека под программу курса',
    ],
    examples: [
      'практический трек по языку или теме',
      'алгоритмы и структуры данных',
      'подготовка к стажировкам',
      'домашние задания',
    ],
    featured: false,
  },
  {
    icon: Tag,
    name: 'Leetcot White Label',
    tagline: 'Отдельный формат под бренд партнёра',
    description:
      'Для крупных партнёров Leetcot может работать как co-branded или white-label платформа: отдельное пространство, задачи и оформление под конкретный бренд или образовательный проект.',
    items: [
      'отдельная страница или раздел',
      'бренд партнёра',
      'кастомные треки',
      'приватные задачи',
      'закрытые контесты',
      'экспорт результатов',
    ],
    examples: ['дальнейшая интеграция по договорённости'],
    featured: true,
  },
];

const pilotSteps = [
  { num: '1', title: 'Выбираем формат', text: 'Challenge, учебный трек, скрининг или закрытый контест.' },
  { num: '2', title: 'Готовим задачи', text: 'Подбираем или создаём 10–20 задач: SQL как отдельный формат, код — с нужным языком решения.' },
  { num: '3', title: 'Запускаем страницу', text: 'Участники получают ссылку на отдельный трек или челлендж.' },
  { num: '4', title: 'Собираем результаты', text: 'Организатор получает рейтинг, таблицу результатов и краткий отчёт.' },
];

const reasons = [
  'не нужно разрабатывать платформу с нуля',
  'можно быстро проверить формат на небольшой аудитории',
  'разные типы практики: код, SQL, треки и контесты',
  'можно запускать публичные и приватные треки',
  'формат подходит для обучения, найма и developer engagement',
  'платформа гибко дорабатывается под партнёра',
];

const scenarios = [
  { audience: 'Для компании', name: '«Company SQL Challenge»', text: 'публичный челлендж для аналитиков и разработчиков.' },
  { audience: 'Для университета', name: '«University Algorithms Warmup»', text: 'тренировочный трек для студентов и абитуриентов.' },
  { audience: 'Для HR-команды', name: '«Junior Backend Screening»', text: 'набор задач для первичной оценки кандидатов.' },
  { audience: 'Для онлайн-школы', name: '«SQL Practice Track»', text: 'домашние задания и практика с автопроверкой.' },
];

function GradientButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Button
      asChild
      className="h-12 rounded-xl border-0 bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 text-base font-bold text-white transition-transform hover:scale-[1.02] hover:from-pink-400 hover:to-fuchsia-500"
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export default function PartnersPage() {
  return (
    <>
      <main className="bg-[#09090b] text-white">
        <section className="relative border-b border-zinc-900">
          <div className="pointer-events-none absolute left-[10%] top-[15%] -z-10 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="pointer-events-none absolute right-[10%] top-[5%] -z-10 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="container flex flex-col items-center gap-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-sm font-bold text-pink-300">
              <Building2 className="h-4 w-4" />
              Для партнёров
            </div>

            <h1 className="max-w-3xl font-dela-gothic text-4xl font-normal leading-[1.15] tracking-tight md:text-6xl">
              <span className="bg-gradient-to-br from-white from-20% via-pink-400 via-55% to-fuchsia-600 to-90% bg-clip-text text-transparent">
                Запускайте coding challenges, учебные треки и технические отборы на базе Leetcot
              </span>
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-white/50">
              Leetcot — платформа для практики программирования: задачи по коду, отдельная SQL-практика,
              алгоритмы и контесты. На базе Leetcot можно быстро запустить branded challenge, образовательный
              трек, технический скрининг кандидатов или white-label формат под задачи партнёра.
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <GradientButton href="https://t.me/cosharra">Обсудить пилот</GradientButton>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-zinc-700 bg-zinc-950 px-6 text-base font-bold text-zinc-100 hover:bg-zinc-900"
              >
                <Link href="/explore">
                  Посмотреть платформу
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <a
              href="https://t.me/cosharra"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-zinc-500 transition-colors hover:text-pink-300"
            >
              Telegram: @cosharra
            </a>

            <div className="mt-6 grid w-full max-w-xl grid-cols-3 gap-3 border-t border-zinc-900 pt-8">
              {[
                ['4', 'формата продукта'],
                ['7', 'языков кода'],
                ['1–2 нед.', 'на запуск пилота'],
              ].map(([value, label]) => (
                <div key={label} className="text-center">
                  <div className="font-mono text-2xl font-black text-pink-300 md:text-3xl">{value}</div>
                  <div className="mt-1 text-xs text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-zinc-900 py-6">
          <div className="flex w-max animate-[infinite-scroll-x_28s_linear_infinite] gap-3 px-4">
            {[...stack, ...stack].map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-sm text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="border-b border-zinc-900 py-16">
          <div className="container">
            <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Для кого
            </p>
            <h2 className="text-center text-2xl font-black md:text-3xl">
              Leetcot подходит для компаний, университетов, онлайн-школ и IT-сообществ
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-zinc-500">
              Платформу можно использовать там, где нужно вовлечь IT-аудиторию, дать практические
              задачи, провести контест, проверить навыки или запустить образовательный трек.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-pink-400/40"
                >
                  <Icon className="mb-3 h-5 w-5 text-pink-400" />
                  <h3 className="font-bold text-zinc-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 py-16">
          <div className="container">
            <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Что предлагаем
            </p>
            <h2 className="text-center text-2xl font-black md:text-3xl">Продукты</h2>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {products.map((product) => (
                <div
                  key={product.name}
                  className={`rounded-2xl border bg-zinc-950 p-6 ${
                    product.featured ? 'border-pink-400' : 'border-zinc-800'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 p-2">
                      <product.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-zinc-50">{product.name}</h3>
                      <p className="text-sm text-pink-300">{product.tagline}</p>
                    </div>
                  </div>

                  <p className="mb-4 text-sm leading-6 text-zinc-400">{product.description}</p>

                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-600">
                    Что входит
                  </p>
                  <ul className="mb-4 space-y-1.5 text-sm text-zinc-400">
                    {product.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-400" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    {product.examples.map((example) => (
                      <span
                        key={example}
                        className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-500"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-zinc-950/60 py-16">
          <div className="container">
            <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Как это работает
            </p>
            <h2 className="text-center text-2xl font-black md:text-3xl">
              Пилот можно запустить без сложной интеграции
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pilotSteps.map((step) => (
                <div key={step.num} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="font-mono text-2xl font-black text-pink-400">{step.num}</div>
                  <h3 className="mt-2 font-bold text-zinc-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center text-sm text-zinc-400">
              <span className="font-bold text-zinc-200">Типовой пилот: </span>
              30–100 участников, 10–20 задач, 1–2 недели подготовки, отдельная страница, рейтинг и
              выгрузка результатов.
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 py-16">
          <div className="container">
            <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Аргументы
            </p>
            <h2 className="text-center text-2xl font-black md:text-3xl">Почему Leetcot</h2>
            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                  <span className="text-sm text-zinc-400">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-zinc-950/60 py-16">
          <div className="container">
            <p className="mb-3 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
              Примеры
            </p>
            <h2 className="text-center text-2xl font-black md:text-3xl">
              Что можно запустить на Leetcot
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {scenarios.map((scenario) => (
                <div key={scenario.name} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-pink-400">
                    {scenario.audience}
                  </p>
                  <h3 className="mt-2 font-bold text-zinc-100">{scenario.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{scenario.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 py-16">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl font-black md:text-3xl">О Leetcot</h2>
            <p className="mt-6 leading-8 text-zinc-400">
              Leetcot.ru — независимая платформа для практики программирования: задачи по коду,
              SQL-практика, алгоритмы и coding challenges. Проект развивает Летуновский Владимир, школьник и разработчик
              платформы.
            </p>
            <p className="mt-4 leading-8 text-zinc-400">
              Цель Leetcot — сделать практику программирования понятной, доступной и полезной для
              студентов, школьников, начинающих разработчиков и компаний, которые работают с
              IT-аудиторией.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container flex flex-col items-center gap-5 text-center">
            <h2 className="max-w-xl text-2xl font-black md:text-3xl">
              Хотите запустить пилотный challenge или учебный трек?
            </h2>
            <p className="max-w-xl text-zinc-500">
              Предложите формат, аудиторию и тему задач — мы подготовим пилот на базе Leetcot.
            </p>
            <GradientButton href="https://t.me/cosharra">Обсудить пилот</GradientButton>
            <p className="font-mono text-sm text-zinc-500">
              Telegram: @cosharra · Сайт: Leetcot.ru
            </p>
          </div>
        </section>
      </main>
      <Footsies />
    </>
  );
}
