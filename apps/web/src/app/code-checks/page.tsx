import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BadgeInfo, FileCode, Info } from '@repo/ui/icons';
import { Button } from '@repo/ui/components/button';
import { Footsies } from '~/components/footsies';
import { buildMetaForDefault } from '../metadata';

export function generateMetadata(): Metadata {
  return buildMetaForDefault({
    title: 'Как мы проверяем код',
    description:
      'Как ЛитКот запускает решения на Python, SQL и Go: формат ответа, ограничения песочницы и частые ошибки.',
  });
}

const languages = [
  {
    name: 'Python',
    tone: 'пиши функцию, которую просит условие',
    items: [
      'Оставляйте в решении нужную функцию с тем же именем, что в условии: например, find_sausage(...) или two_fish(...).',
      'Не читайте input() и не печатайте ответ через print(): тесты сами вызывают вашу функцию и сравнивают return.',
      'Возвращайте значение нужного типа: число, строку, список, словарь или tuple, как просит задача.',
      'Не запускайте бесконечные циклы и тяжёлые переборы. Если проверка пишет таймаут, чаще всего граница цикла не двигается.',
    ],
  },
  {
    name: 'SQL',
    tone: 'пиши один запрос или изменение данных',
    items: [
      'Для задач на выборку используйте SELECT или WITH. Для задач на изменение пишите нужный INSERT, UPDATE или DELETE.',
      'Не создавайте свои таблицы поверх условия: схема и тестовые данные уже подготовлены проверкой.',
      'Старайтесь задавать понятные имена колонок через AS, если задача ждёт конкретный результат.',
      'Проверка гоняет запрос на нескольких наборах данных, поэтому хардкодить один видимый пример бесполезно.',
    ],
  },
  {
    name: 'Go',
    tone: 'одна функция в package main',
    items: [
      'Можно писать только функцию решения: ЛитКот сам добавит package main, если вы его не написали.',
      'Не объявляйте одну и ту же функцию дважды. Если вставили новый вариант, удалите старый.',
      'Имя функции, аргументы и возвращаемый тип должны совпадать с заготовкой: CountFullBowls(...), FindSnackIndex(...) и так далее.',
      'Не используйте fmt.Scan и чтение stdin: тесты импортируют ваш файл и вызывают функцию напрямую.',
    ],
  },
];

const sandboxRules = [
  'Код запускается в изолированной песочнице без сети.',
  'У проверки есть лимит по времени, памяти и числу процессов.',
  'Скрытые тесты используют другие данные, поэтому решение должно работать по общему правилу, а не только по примеру.',
  'Если задача упала с ошибкой вроде list index out of range, это не компиляция: код запустился, но сломался на одном из тестов.',
];

export default function CodeChecksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#121018] text-white">
      <main className="flex-grow">
        <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-16 sm:py-20">
          <div className="from-[#ec4899]/16 pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b to-transparent" />
          <div className="bg-[#2dd4bf]/12 pointer-events-none absolute right-0 top-20 -z-10 h-[34rem] w-[46rem] rounded-l-full blur-3xl" />
          <div className="container">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-2 text-sm font-black text-[#ffaad8] shadow-2xl shadow-pink-950/10">
                <BadgeInfo className="h-4 w-4" />
                проверка решений
              </div>
              <h1
                className="max-w-4xl text-balance text-4xl leading-[1.14] tracking-normal sm:text-5xl md:text-6xl"
                style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
              >
                Как писать код, чтобы ЛитКот понял решение
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#d8d4df]/80 sm:text-lg">
                Проверка не читает решение как человек. Она запускает ваш код в песочнице, вызывает
                нужную функцию или SQL-запрос и сравнивает результат с эталоном на видимых и
                скрытых тестах.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="container grid gap-5 lg:grid-cols-3">
            {languages.map((language) => (
              <article
                key={language.name}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8ef0de] text-[#121018]">
                    <FileCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{language.name}</h2>
                    <p className="text-sm font-semibold text-[#d8d4df]/60">{language.tone}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-3 text-sm font-semibold leading-6 text-[#d8d4df]/78">
                  {language.items.map((item) => (
                    <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="container grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(280px,0.38fr)]">
            <div className="rounded-[1.5rem] border border-[#ff8ecb]/20 bg-[#211827]/70 p-6">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-[#ffaad8]" />
                <h2 className="text-2xl font-black">Ограничения песочницы</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm font-semibold leading-6 text-[#d8d4df]/78">
                {sandboxRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-[#8ef0de]/25 bg-[#1b1722]/85 p-6">
              <pre className="w-fit select-none font-mono text-sm font-black leading-5 text-[#ff8ecb]/55">{` /\\_/\\\\
( o.o )
 > ^ <`}</pre>
              <h2 className="mt-6 text-2xl font-black">Если проверка упала</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#d8d4df]/75">
                Сначала смотрите первый красный тест. Он обычно говорит, что именно случилось:
                неверный ответ, ошибка выполнения, таймаут или повторное объявление функции.
              </p>
              <Button
                asChild
                className="mt-6 h-11 rounded-2xl bg-[#8ef0de] px-5 text-sm font-black text-[#121018] hover:bg-[#a8fff0]"
              >
                <Link href="/explore">
                  Вернуться к задачкам
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footsies />
    </div>
  );
}
