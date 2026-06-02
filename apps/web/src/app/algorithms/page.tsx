import { Footsies } from '~/components/footsies';
import { Balancer } from 'react-wrap-balancer';
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';
import { Compass, Play } from '@repo/ui/icons';

export default function AlgorithmsLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-zinc-950">
          <div className="container relative z-10 flex flex-col items-center text-center">
            <pre className="mb-6 text-[18px] font-bold leading-5 text-pink-500">
              {`
   |\\__/,|   (\`\\
 _.o o  |_   ) )
-(((---(((--------
`}
            </pre>
            <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-white sm:text-8xl" style={{ fontFamily: '"Dela Gothic One", sans-serif' }}>
              Щелкаем алгоритмы <span className="text-pink-500">как рыбку</span>
            </h1>
            <p className="max-w-[60ch] mb-10 text-xl text-zinc-400">
              <Balancer>
                Погрузись в мир мощных алгоритмов на Python. От сортировки сосисок до поиска кратчайшего пути к миске. Стань настоящим альфа-котом в мире кода!
              </Balancer>
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-xl rounded-2xl shadow-[0_0_2rem_-0.5rem_#d946ef88]">
                <Link href="/courses/python-algo-fish">
                  <Play className="mr-2 h-6 w-6" /> Начать охоту
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-zinc-700 text-white px-8 py-6 text-xl rounded-2xl hover:bg-zinc-900">
                <Link href="/explore?language=PYTHON">
                  <Compass className="mr-2 h-6 w-6" /> Все задачи
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Feature Block */}
        <section className="py-20 bg-zinc-900/50">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col p-8 rounded-3xl border border-zinc-800 bg-zinc-900 hover:border-pink-500/50 transition-colors">
                <div className="mb-4 text-4xl">🐟</div>
                <h3 className="mb-2 text-2xl font-bold text-white">Сортировка улова</h3>
                <p className="text-zinc-400">Научись сортировать списки эффективно. От Bubble Sort до Quick Sort, чтобы ни одна рыбка не потерялась.</p>
              </div>
              <div className="flex flex-col p-8 rounded-3xl border border-zinc-800 bg-zinc-900 hover:border-pink-500/50 transition-colors">
                <div className="mb-4 text-4xl">🧶</div>
                <h3 className="mb-2 text-2xl font-bold text-white">Графы и Клубки</h3>
                <p className="text-zinc-400">Распутай самые сложные структуры данных. Поиск в ширину и глубину в мире кошачьих лабиринтов.</p>
              </div>
              <div className="flex flex-col p-8 rounded-3xl border border-zinc-800 bg-zinc-900 hover:border-pink-500/50 transition-colors">
                <div className="mb-4 text-4xl">🐾</div>
                <h3 className="mb-2 text-2xl font-bold text-white">Динамическое Мяу</h3>
                <p className="text-zinc-400">Оптимизируй свои решения. Используй мемоизацию, чтобы решать задачи быстрее, чем кот прыгает за лазером.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footsies />
    </div>
  );
}
