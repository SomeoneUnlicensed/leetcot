'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ── Types ──

export interface WallConfig {
  /** Список стен: каждая стена — [row, col, direction] */
  walls: [number, number, 'top' | 'right' | 'bottom' | 'left'][];
}

interface RobotState {
  row: number;
  col: number;
}

type CellState = 'empty' | 'painted' | 'wall-top' | 'wall-right' | 'wall-bottom' | 'wall-left';

interface ParsedCommand {
  type: 'move' | 'paint' | 'repeat' | 'if';
  direction?: 'up' | 'down' | 'left' | 'right';
  condition?: string;
  body?: ParsedCommand[];
  count?: number;
  raw: string;
}

// ── Default field ──

const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 10;

function createEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array(cols).fill('empty'));
}

function hasWallAt(
  grid: string[][],
  r: number,
  c: number,
  dir: 'top' | 'right' | 'bottom' | 'left',
  walls: WallConfig['walls'],
): boolean {
  return walls.some(([wr, wc, wd]) => wr === r && wc === c && wd === dir);
}

function canMove(
  grid: string[][],
  row: number,
  col: number,
  dir: 'up' | 'down' | 'left' | 'right',
  walls: WallConfig['walls'],
): boolean {
  const rows = grid.length;
  const cols = grid[0].length;

  switch (dir) {
    case 'up':
      if (row <= 0) return false;
      if (hasWallAt(grid, row, col, 'top', walls)) return false;
      if (hasWallAt(grid, row - 1, col, 'bottom', walls)) return false;
      return true;
    case 'down':
      if (row >= rows - 1) return false;
      if (hasWallAt(grid, row, col, 'bottom', walls)) return false;
      if (hasWallAt(grid, row + 1, col, 'top', walls)) return false;
      return true;
    case 'left':
      if (col <= 0) return false;
      if (hasWallAt(grid, row, col, 'left', walls)) return false;
      if (hasWallAt(grid, row, col - 1, 'right', walls)) return false;
      return true;
    case 'right':
      if (col >= cols - 1) return false;
      if (hasWallAt(grid, row, col, 'right', walls)) return false;
      if (hasWallAt(grid, row, col + 1, 'left', walls)) return false;
      return true;
  }
}

// ── Simple Robot language parser ──
// Поддерживает: вверх, вниз, влево, вправо, закрасить,
//   нц пока <условие> ... кц, нц <N> раз ... кц

function parseRobotCode(code: string): ParsedCommand[] {
  const lines = code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));
  return parseBlock(lines, 0).commands;
}

function parseBlock(
  lines: string[],
  startIdx: number,
): { commands: ParsedCommand[]; nextIdx: number } {
  const commands: ParsedCommand[] = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('кц')) {
      return { commands, nextIdx: i + 1 };
    }

    if (line.startsWith('нц пока ')) {
      const condition = line.slice('нц пока '.length).trim();
      const body = parseBlock(lines, i + 1);
      commands.push({ type: 'repeat', condition, body: body.commands, raw: line });
      i = body.nextIdx;
      continue;
    }

    if (line.startsWith('нц ')) {
      const match = line.match(/нц\s+(\d+)\s+раз/);
      if (match) {
        const count = parseInt(match[1], 10);
        const body = parseBlock(lines, i + 1);
        commands.push({ type: 'repeat', count, body: body.commands, raw: line });
        i = body.nextIdx;
        continue;
      }
    }

    if (line.startsWith('если ')) {
      const condition = line.slice('если '.length).trim();
      const body = parseBlock(lines, i + 1);
      commands.push({ type: 'if', condition, body: body.commands, raw: line });
      i = body.nextIdx;
      continue;
    }

    switch (line) {
      case 'вверх':
        commands.push({ type: 'move', direction: 'up', raw: line });
        break;
      case 'вниз':
        commands.push({ type: 'move', direction: 'down', raw: line });
        break;
      case 'влево':
        commands.push({ type: 'move', direction: 'left', raw: line });
        break;
      case 'вправо':
        commands.push({ type: 'move', direction: 'right', raw: line });
        break;
      case 'закрасить':
        commands.push({ type: 'paint', raw: line });
        break;
      default:
        // пропускаем непонятные строки
        break;
    }

    i++;
  }

  return { commands, nextIdx: i };
}

// ── Robot Simulator Component ──

interface RobotSimulatorProps {
  rows?: number;
  cols?: number;
  initialRow?: number;
  initialCol?: number;
  walls?: WallConfig['walls'];
}

export function RobotSimulator({
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  initialRow = 0,
  initialCol = 0,
  walls = [],
}: RobotSimulatorProps) {
  const [robot, setRobot] = useState<RobotState>({ row: initialRow, col: initialCol });
  const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid(rows, cols));
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [log, setLog] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(-1);

  const abortRef = useRef(false);
  const pauseRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, msg]);
  }, []);

  const reset = useCallback(() => {
    setRobot({ row: initialRow, col: initialCol });
    setGrid(createEmptyGrid(rows, cols));
    setLog([]);
    setCurrentLine(-1);
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
  }, [initialRow, initialCol, rows, cols]);

  const checkCondition = useCallback(
    (condition: string): boolean => {
      const cond = condition.trim();
      const dirMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        'сверху свободно': 'up',
        'снизу свободно': 'down',
        'слева свободно': 'left',
        'справа свободно': 'right',
      };

      const dir = dirMap[cond];
      if (dir) {
        return canMove(grid, robot.row, robot.col, dir, walls);
      }

      if (cond === 'клетка закрашена') {
        return grid[robot.row]?.[robot.col] === 'painted';
      }

      if (cond === 'клетка чистая') {
        return grid[robot.row]?.[robot.col] !== 'painted';
      }

      // отрицания
      if (cond.startsWith('не ')) {
        return !checkCondition(cond.slice(3));
      }

      return false;
    },
    [grid, robot, walls],
  );

  const executeCommands = useCallback(
    async (commands: ParsedCommand[]) => {
      for (let idx = 0; idx < commands.length; idx++) {
        if (abortRef.current) return;

        while (pauseRef.current) {
          await new Promise((r) => setTimeout(r, 100));
          if (abortRef.current) return;
        }

        const cmd = commands[idx];
        setCurrentLine(idx);
        await new Promise((r) => setTimeout(r, speed));

        switch (cmd.type) {
          case 'move': {
            if (!canMove(grid, robot.row, robot.col, cmd.direction!, walls)) {
              addLog(`❌ Не могу двигаться ${cmd.direction} (стена или граница)`);
              continue;
            }
            setRobot((prev) => {
              const delta: Record<string, [number, number]> = {
                up: [-1, 0],
                down: [1, 0],
                left: [0, -1],
                right: [0, 1],
              };
              const [dr, dc] = delta[cmd.direction!];
              return { row: prev.row + dr, col: prev.col + dc };
            });
            break;
          }
          case 'paint': {
            setGrid((prev) => {
              const next = prev.map((r) => [...r]);
              next[robot.row][robot.col] = 'painted';
              return next;
            });
            addLog(`🎨 Закрашена клетка (${robot.row + 1}, ${robot.col + 1})`);
            break;
          }
          case 'repeat': {
            const count = cmd.count ?? 1000; // защита от бесконечного цикла
            const condition = cmd.condition;
            if (condition) {
              let iterations = 0;
              while (checkCondition(condition) && iterations < count) {
                if (abortRef.current) return;
                await executeCommands(cmd.body ?? []);
                iterations++;
              }
              if (iterations >= count) {
                addLog('⚠️ Достигнут лимит итераций (возможно, бесконечный цикл)');
              }
            } else {
              for (let c = 0; c < count; c++) {
                if (abortRef.current) return;
                await executeCommands(cmd.body ?? []);
              }
            }
            break;
          }
          case 'if': {
            if (checkCondition(cmd.condition ?? '')) {
              await executeCommands(cmd.body ?? []);
            }
            break;
          }
        }
      }
    },
    [grid, robot, walls, speed, addLog, checkCondition],
  );

  const run = useCallback(async () => {
    if (isRunning) return;
    abortRef.current = false;
    pauseRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    setLog([]);

    const commands = parseRobotCode(code);
    if (commands.length === 0) {
      addLog('⚠️ Нет команд для выполнения');
      setIsRunning(false);
      return;
    }

    addLog(`▶️ Запуск: ${commands.length} команд`);
    await executeCommands(commands);
    addLog('✅ Выполнение завершено');
    setIsRunning(false);
    setCurrentLine(-1);
  }, [isRunning, code, executeCommands, addLog]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => {
      pauseRef.current = !p;
      return !p;
    });
  }, []);

  const paintedCount = grid.flat().filter((c) => c === 'painted').length;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Поле */}
      <div className="flex-shrink-0">
        <div
          className="grid gap-px rounded-lg border border-zinc-700 bg-zinc-800 p-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: `${cols * 44 + 8}px`,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const isRobot = robot.row === r && robot.col === c;
              const isPainted = grid[r][c] === 'painted';
              const hasWallTop = hasWallAt(grid, r, c, 'top', walls);
              const hasWallRight = hasWallAt(grid, r, c, 'right', walls);
              const hasWallBottom = hasWallAt(grid, r, c, 'bottom', walls);
              const hasWallLeft = hasWallAt(grid, r, c, 'left', walls);

              return (
                <div
                  key={`${r}-${c}`}
                  className="relative flex h-10 w-10 items-center justify-center text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: isRobot
                      ? '#8ef0de'
                      : isPainted
                        ? '#ff8ecb'
                        : '#1a1a2e',
                    borderTop: hasWallTop ? '2px solid #ef4444' : '1px solid #333',
                    borderRight: hasWallRight ? '2px solid #ef4444' : '1px solid #333',
                    borderBottom: hasWallBottom ? '2px solid #ef4444' : '1px solid #333',
                    borderLeft: hasWallLeft ? '2px solid #ef4444' : '1px solid #333',
                  }}
                >
                  {isRobot && (
                    <span className="text-xl" role="img" aria-label="robot">
                      🤖
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>
        <div className="mt-2 flex gap-2 text-xs text-zinc-400">
          <span>🤖 ({robot.row + 1}, {robot.col + 1})</span>
          <span>🎨 {paintedCount}</span>
        </div>
      </div>

      {/* Редактор и управление */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <textarea
          className="min-h-[200px] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 font-mono text-sm text-green-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder={`Введите алгоритм для Робота...
Пример:
  нц пока справа свободно
    закрасить
    вправо
  кц`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />

        {/* Кнопки быстрой вставки команд */}
        <div className="flex flex-wrap gap-1">
          {['вверх', 'вниз', 'влево', 'вправо', 'закрасить'].map((cmd) => (
            <button
              key={cmd}
              className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-700"
              onClick={() => setCode((c) => c + (c ? '\n' : '') + cmd)}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Управление */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-40"
            onClick={run}
            disabled={isRunning}
          >
            ▶ Запустить
          </button>
          <button
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-40"
            onClick={togglePause}
            disabled={!isRunning}
          >
            {isPaused ? '▶ Продолжить' : '⏸ Пауза'}
          </button>
          <button
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
            onClick={reset}
          >
            🔄 Сброс
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
            <span>Скорость:</span>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={1000 - speed + 50}
              onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        {/* Лог */}
        {log.length > 0 && (
          <div className="max-h-[120px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs text-zinc-400">
            {log.map((entry, i) => (
              <div key={i} className="py-0.5">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
