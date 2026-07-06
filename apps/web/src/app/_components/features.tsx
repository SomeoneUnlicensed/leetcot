import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Target,
  Users,
} from '@repo/ui/icons';
import type { LucideIcon } from '@repo/ui/icons';

const practiceSteps = [
  {
    title: 'Откройте нужный раздел',
    text: 'Алгоритмы, SQL и Go вынесены в отдельные направления, чтобы не смешивать разные форматы практики.',
    className: 'border-[#ff8ecb]/30 bg-[#1b1722]',
    accent: 'text-[#ff8ecb]',
  },
  {
    title: 'Решите задачу в редакторе',
    text: 'Условие и код открываются рядом. После запуска система проверяет решение и показывает результат.',
    className: 'border-[#8ef0de]/25 bg-[#161c22]',
    accent: 'text-[#8ef0de]',
  },
  {
    title: 'Смотрите историю решений',
    text: 'Успешные решения, попытки и прогресс по трекам сохраняются в профиле.',
    className: 'border-[#e9f6a8]/25 bg-[#1e1a16]',
    accent: 'text-[#e9f6a8]',
  },
];

const audiences: {
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'Самостоятельная практика',
    text: 'Короткие задачи для повторения базовых тем и подготовки к собеседованиям.',
    icon: Target,
  },
  {
    title: 'Учебные группы',
    text: 'Экзамены, импорт задач и результаты попыток для занятий и отбора.',
    icon: GraduationCap,
  },
  {
    title: 'Сообщество',
    text: 'Обсуждения и опубликованные решения помогают сравнивать подходы после успешной проверки.',
    icon: Users,
  },
];

const productParts = [
  { label: 'Задачи', icon: BookOpen },
  { label: 'Треки', icon: CheckCircle2 },
  { label: 'Курсы', icon: Award },
  { label: 'Обсуждения', icon: MessageCircle },
  { label: 'Бейджи', icon: Sparkles },
];

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
    <section className="bg-[#121018] text-white" id="features">
      <div className="container border-t border-white/10 py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#8ef0de]">
              как устроено
            </p>
            <h2
              className="mt-4 max-w-2xl text-4xl leading-none tracking-normal sm:text-6xl"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              От задачи до результата{' '}
              <span className="bg-gradient-to-r from-[#ff8ecb] via-[#e9f6a8] to-[#8ef0de] bg-clip-text text-transparent">
                без лишних шагов
              </span>
            </h2>
          </div>
          <p className="max-w-2xl text-xl font-bold leading-8 text-[#d8d4df]/80">
            ЛитКот открывает условие, редактор и проверку в одном сценарии. Пользователь решает
            задачу, получает статус запуска и возвращается к треку или курсу.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {practiceSteps.map((step, index) => (
            <div key={step.title} className={`rounded-[1.75rem] border p-6 ${step.className}`}>
              <p className={`font-mono text-sm font-black ${step.accent}`}>0{index + 1}</p>
              <h3 className="mt-8 text-2xl font-black leading-tight text-white">{step.title}</h3>
              <p className="mt-3 text-base font-semibold leading-7 text-[#d8d4df]/65">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-[#e9f6a8]">сценарии</p>
            <div className="mt-6 grid gap-4">
              {audiences.map((audience) => (
                <AudienceCard key={audience.title} {...audience} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#ff8ecb]/35 bg-[#1b1722] p-6 text-white lg:self-start">
            <p className="text-sm font-black uppercase tracking-widest">внутри ЛитКота</p>
            <h2
              className="mt-4 text-4xl leading-none tracking-normal"
              style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
            >
              Всё, что нужно для практики
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {productParts.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl bg-[#121018] p-4 text-white"
                >
                  <Icon className="h-5 w-5 text-[#ff8ecb]" />
                  <span className="text-base font-black">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg font-bold leading-7 text-[#d8d4df]/75">
              Эти разделы уже связаны между собой: задачи входят в треки и курсы, попытки
              сохраняются, а обсуждения доступны после решения.
            </p>
          </div>
        </div>
      </div>

      <div className="h-24 bg-gradient-to-b from-[#121018] to-black/0" />
    </section>
  );
}
