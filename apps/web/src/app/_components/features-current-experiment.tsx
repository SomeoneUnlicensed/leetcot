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
    text: 'Подборки и треки помогают не прыгать случайно между темами, как кот за лазерной точкой.',
    className: 'bg-[#f3c4a8]',
  },
  {
    title: 'Решите и посмотрите чужой след',
    text: 'После решения можно открыть обсуждения и сравнить подходы других участников.',
    className: 'bg-[#9fd8d2]',
  },
  {
    title: 'Соберите прогресс по лапкам',
    text: 'Профиль, бейджи и пройденные треки показывают, какие темы уже закреплены.',
    className: 'bg-[#e9f6a8]',
  },
];

const audiences: {
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'Самостоятельная практика',
    text: 'Короткие задачи, курсы и треки для регулярного роста без перегруза и лишней суеты.',
    icon: Target,
  },
  {
    title: 'Учебные группы',
    text: 'Экзамены, вопросы и результаты, чтобы преподавателю было проще вести занятие.',
    icon: GraduationCap,
  },
  {
    title: 'Сообщество',
    text: 'Профили, решения и обсуждения помогают учиться не в одиночку: рядом всегда есть чей-то след.',
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
    <div className="rounded-[1.75rem] border border-white/10 bg-[#251d2a] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3c4a8] text-[#171a22]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-2xl font-black text-white">{title}</h3>
      <p className="mt-3 text-base font-semibold leading-7 text-zinc-300">{text}</p>
    </div>
  );
}

export function Features() {
  return (
    <section className="bg-[#18151f] text-white" id="features">
      <div className="container border-t border-white/10 py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#9fd8d2]">
              кошачий маршрут
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-none tracking-normal sm:text-6xl">
              Меньше случайных прыжков, больше{' '}
              <span className="text-[#e9f6a8]">понятного движения</span>
            </h2>
          </div>
          <p className="max-w-2xl text-xl font-bold leading-8 text-zinc-300">
            ЛитКот собирает практику в последовательность: выбрали тему, решили несколько задач,
            увидели результат и спокойно пошли дальше.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {practiceSteps.map((step, index) => (
            <div
              key={step.title}
              className={`rounded-[1.75rem] p-6 text-[#171a22] ${step.className}`}
            >
              <p className="text-sm font-black opacity-70">0{index + 1}</p>
              <h3 className="mt-8 text-2xl font-black leading-tight">{step.title}</h3>
              <p className="mt-3 text-base font-semibold leading-7 text-[#34303a]/75">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#f5efe5] py-24 text-[#171a22] sm:py-32">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#2f736d]">
              языки в миске
            </p>
            <h2 className="mt-4 text-4xl font-black leading-none tracking-normal sm:text-6xl">
              Платформа растёт за пределы одного языка
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {languages.map((language, index) => (
              <div
                key={language}
                className="rounded-2xl bg-[#18151f] px-4 py-5 text-center text-lg font-black text-white"
              >
                {language}
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#9fd8d2]">
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
            <p className="text-sm font-black uppercase tracking-widest text-[#f3c4a8]">
              кому мурчит
            </p>
            <div className="mt-6 grid gap-4">
              {audiences.map((audience) => (
                <AudienceCard key={audience.title} {...audience} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#f3c4a8] p-6 text-[#171a22] lg:self-start">
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
                  <Icon className="h-5 w-5 text-[#e9f6a8]" />
                  <span className="text-base font-black">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg font-bold leading-7">
              Коты здесь не декорация ради декорации: они задают тон, помогают запомнить платформу и
              не мешают решать задачи.
            </p>
          </div>
        </div>
      </div>

      <div className="h-24 bg-gradient-to-b from-[#18151f] to-black/0" />
    </section>
  );
}
