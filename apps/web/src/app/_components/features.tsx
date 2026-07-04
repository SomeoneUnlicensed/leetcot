import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
} from '@repo/ui/icons';
import type { LucideIcon } from '@repo/ui/icons';

const practiceSteps = [
  {
    title: 'Выберите задачу без охоты вслепую',
    text: 'Треки ведут по следу: от простых задач к Python, SQL, алгоритмам и структурам данных.',
    className: 'border-pink-400/30 bg-zinc-950',
    accent: 'text-pink-300',
  },
  {
    title: 'Решите и посмотрите чужой след',
    text: 'После решения можно открыть обсуждения и увидеть, какими тропами прошли другие.',
    className: 'border-fuchsia-400/30 bg-zinc-950',
    accent: 'text-fuchsia-300',
  },
  {
    title: 'Следите за прогрессом',
    text: 'Профиль показывает решенные задачи, курсы и темы, к которым ЛитКот мягко вернет позже.',
    className: 'border-cyan-400/25 bg-zinc-950',
    accent: 'text-cyan-300',
  },
];

const audiences: {
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'Самостоятельная практика',
    text: 'Короткие задачи, курсы и треки для регулярного роста: по чуть-чуть, но каждый день.',
    icon: Target,
  },
  {
    title: 'Учебные группы',
    text: 'Экзамены, вопросы и результаты, чтобы преподавателю было проще вести занятие.',
    icon: GraduationCap,
  },
  {
    title: 'Сообщество',
    text: 'Профили, решения и обсуждения помогают учиться не в одиночку: рядом всегда есть чей-то умный след.',
    icon: Users,
  },
];

const productParts = [
  { label: 'Задачи', icon: BookOpen },
  { label: 'Треки', icon: CheckCircle2 },
  { label: 'Курсы', icon: Award },
  { label: 'Обсуждения', icon: MessageCircle },
  { label: 'Бейджи', icon: Sparkles },
  { label: 'Чемпионаты', icon: Trophy },
];

const languages = ['Python', 'SQL', 'TypeScript', 'C++', 'Rust', 'Java', 'Go', 'Ruby'];

function AudienceCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-pink-400/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-2xl font-black text-white">{title}</h3>
      <p className="mt-3 text-base font-semibold leading-7 text-zinc-300">{text}</p>
    </div>
  );
}

export function Features() {
  return (
    <section className="bg-[#09090b] text-white" id="features">
      <div className="container border-t border-white/10 py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#9fd8d2]">
              учебный маршрут
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-none tracking-normal sm:text-6xl">
              Меньше случайных прыжков, больше{' '}
              <span className="bg-gradient-to-r from-pink-300 to-fuchsia-400 bg-clip-text text-transparent">
                понятного движения
              </span>
            </h2>
          </div>
          <p className="max-w-2xl text-xl font-bold leading-8 text-zinc-300">
            ЛитКот собирает практику в спокойный маршрут: выбрали тему, решили несколько задач,
            увидели результат и пошли дальше без суеты.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {practiceSteps.map((step, index) => (
            <div key={step.title} className={`rounded-2xl border p-6 ${step.className}`}>
              <p className={`font-mono text-sm font-black ${step.accent}`}>0{index + 1}</p>
              <h3 className="mt-8 text-2xl font-black leading-tight text-white">{step.title}</h3>
              <p className="mt-3 text-base font-semibold leading-7 text-zinc-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-y border-zinc-900 bg-zinc-950/60 py-20 text-white sm:py-24">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="font-mono text-sm font-black uppercase tracking-widest text-pink-400">
              языки платформы
            </p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-normal text-white sm:text-5xl">
              Платформа растёт за пределы одного языка
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {languages.map((language, index) => (
              <div
                key={language}
                className="rounded-xl border border-zinc-800 bg-[#09090b] px-4 py-5 text-center text-lg font-black text-white"
              >
                {language}
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-pink-300">
                  {index < 2 ? 'доступен' : 'в плане'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#f3c4a8]">для кого</p>
            <div className="mt-6 grid gap-4">
              {audiences.map((audience) => (
                <AudienceCard key={audience.title} {...audience} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-pink-400/40 bg-zinc-950 p-6 text-white lg:self-start">
            <p className="text-sm font-black uppercase tracking-widest">внутри ЛитКота</p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-normal">
              Всё, что нужно для практики
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {productParts.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl bg-[#171a22] p-4 text-white"
                >
                  <Icon className="h-5 w-5 text-pink-400" />
                  <span className="text-base font-black">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg font-bold leading-7 text-zinc-300">
              Редактор кода, автопроверка, треки, курсы и обсуждения работают как одна система:
              задача открывается, решение проверяется, прогресс сохраняется, а кот отмечает путь.
            </p>
          </div>
        </div>
      </div>

      <div className="h-24 bg-gradient-to-b from-[#09090b] to-black/0" />
    </section>
  );
}
