'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RobotSimulator } from '~/components/oge/robot-simulator';

const PRESETS: {
  name: string;
  desc: string;
  walls: [number, number, 'top' | 'right' | 'bottom' | 'left'][];
}[] = [
  {
    name: 'Пустое поле',
    desc: 'Робот в левом верхнем углу. Никаких стен.',
    walls: [],
  },
  {
    name: 'Коридор',
    desc: 'Роботу нужно пройти по коридору, закрашивая клетки.',
    walls: [
      [0, 2, 'top'], [0, 2, 'bottom'],
      [1, 2, 'top'], [1, 2, 'bottom'],
      [2, 2, 'top'], [2, 2, 'bottom'],
      [3, 2, 'top'], [3, 2, 'bottom'],
      [4, 2, 'top'], [4, 2, 'bottom'],
      [5, 2, 'top'], [5, 2, 'bottom'],
      [6, 2, 'top'], [6, 2, 'bottom'],
      [7, 2, 'top'], [7, 2, 'bottom'],
      [8, 2, 'top'], [8, 2, 'bottom'],
      [9, 2, 'top'],
    ],
  },
  {
    name: 'Препятствие',
    desc: 'Стена справа от робота. Нужно обойти.',
    walls: [
      [0, 3, 'top'], [0, 3, 'bottom'],
      [1, 3, 'top'], [1, 3, 'bottom'],
      [2, 3, 'top'], [2, 3, 'bottom'],
      [3, 3, 'top'], [3, 3, 'bottom'],
      [4, 3, 'top'], [4, 3, 'bottom'],
    ],
  },
];

export function RobotSimulatorPage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  return (
    <div className="container py-8">
      <Link
        href="/oge/modules/oge-2027-algo-prog"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#ffaad8]/70 transition hover:text-[#ffaad8]"
      >
        ← К модулю
      </Link>

      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#ff8ecb]/30 bg-[#211827]/80 px-4 py-1.5 text-xs font-black text-[#ffaad8]">
            Задание 15 · тренажёр
          </div>
          <h1
            className="mt-3 text-2xl leading-tight md:text-3xl"
            style={{ fontFamily: '"Dela Gothic One", sans-serif' }}
          >
            Исполнитель «Робот»
          </h1>
          <p className="mt-3 max-w-2xl font-semibold leading-7 text-[#d8d4df]/65">
            Пишите алгоритмы для Робота на встроенном языке. Используйте команды
            перемещения (вверх, вниз, влево, вправо), закраску клеток, циклы и условия.
            Нажимайте «Запустить» для выполнения.
          </p>
        </div>

        {/* Выбор конфигурации поля */}
        <div className="mb-6 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setPresetIdx(i)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                i === presetIdx
                  ? 'border-[#8ef0de]/40 bg-[#8ef0de]/10 text-[#8ef0de]'
                  : 'border-white/10 bg-white/[0.035] text-[#d8d4df]/60 hover:border-white/20'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="mb-4 text-sm text-[#d8d4df]/50">{preset.desc}</div>

        <RobotSimulator
          rows={10}
          cols={10}
          initialRow={0}
          initialCol={0}
          walls={preset.walls}
        />

        {/* Шпаргалка */}
        <details className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025]">
          <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-[#ffaad8]/70 transition hover:text-[#ffaad8]">
            Шпаргалка — команды Робота
          </summary>
          <div className="border-t border-white/10 px-6 py-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-bold text-white">Движение</h3>
                <ul className="space-y-1 font-mono text-sm text-[#d8d4df]/70">
                  <li><span className="text-[#8ef0de]">вверх</span> — на одну клетку вверх</li>
                  <li><span className="text-[#8ef0de]">вниз</span> — на одну клетку вниз</li>
                  <li><span className="text-[#8ef0de]">влево</span> — на одну клетку влево</li>
                  <li><span className="text-[#8ef0de]">вправо</span> — на одну клетку вправо</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-white">Условия</h3>
                <ul className="space-y-1 font-mono text-sm text-[#d8d4df]/70">
                  <li><span className="text-[#8ef0de]">сверху свободно</span> / <span className="text-[#8ef0de]">стена</span></li>
                  <li><span className="text-[#8ef0de]">справа свободно</span> / <span className="text-[#8ef0de]">стена</span></li>
                  <li><span className="text-[#8ef0de]">снизу свободно</span> / <span className="text-[#8ef0de]">стена</span></li>
                  <li><span className="text-[#8ef0de]">слева свободно</span> / <span className="text-[#8ef0de]">стена</span></li>
                  <li><span className="text-[#8ef0de]">клетка закрашена</span> / <span className="text-[#8ef0de]">чистая</span></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-white">Циклы</h3>
                <pre className="font-mono text-sm text-[#d8d4df]/70">
                  <span className="text-[#8ef0de]">нц пока</span> справа свободно{'\n'}
                  {'  '}закрасить{'\n'}
                  {'  '}вправо{'\n'}
                  <span className="text-[#8ef0de]">кц</span>
                </pre>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-white">Действие</h3>
                <ul className="space-y-1 font-mono text-sm text-[#d8d4df]/70">
                  <li><span className="text-[#8ef0de]">закрасить</span> — закрасить текущую клетку</li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
