'use client';

import '@xterm/xterm/css/xterm.css';
import { Button } from '@repo/ui/components/button';
import { Loader2, Square, Terminal as TerminalIcon } from '@repo/ui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';

type EnvStatus = 'error' | 'idle' | 'running' | 'starting' | 'stopped';

const WindowChrome = ({
  label,
  live,
  onStop,
}: {
  label: string;
  live: boolean;
  onStop?: () => void;
}) => (
  <div className="flex items-center gap-2 bg-[#1b2131] px-4 py-3">
    <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
    <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
    <span className="ml-2 truncate font-mono text-xs text-white/40">{label}</span>
    <div className="ml-auto flex items-center gap-3">
      {live ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          live
        </span>
      ) : null}
      {onStop ? (
        <button
          onClick={onStop}
          aria-label="Остановить окружение"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Square className="h-3 w-3" />
          Стоп
        </button>
      ) : null}
    </div>
  </div>
);

export function TaskTerminal({ taskSlug }: { taskSlug: string }) {
  const [status, setStatus] = useState<EnvStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const termRef = useRef<any>(null);

  const teardownTerminal = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    termRef.current?.dispose();
    termRef.current = null;
  }, []);

  const connectTerminal = useCallback(async () => {
    const [{ Terminal }, { FitAddon }] = await Promise.all([
      import('@xterm/xterm'),
      import('@xterm/addon-fit'),
    ]);

    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
      lineHeight: 1.35,
      theme: {
        background: '#0b0f19',
        foreground: '#e2e8f0',
        cursor: '#00A0FF',
        selectionBackground: '#00A0FF40',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/terminal?taskSlug=${taskSlug}`);
    wsRef.current = ws;

    ws.onmessage = (event) => term.write(event.data as string);
    ws.onclose = () => {
      term.write('\r\n\x1b[31mСоединение закрыто.\x1b[0m\r\n');
    };
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      term.focus();
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [taskSlug]);

  const start = async () => {
    setStatus('starting');
    setError(null);
    try {
      const res = await fetch(`/api/debug-tasks/${taskSlug}/environment`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Не удалось запустить окружение.');
        setStatus('error');
        return;
      }
      setStatus('running');
      await connectTerminal();
    } catch {
      setError('Не удалось запустить окружение.');
      setStatus('error');
    }
  };

  const stop = async () => {
    teardownTerminal();
    await fetch(`/api/debug-tasks/${taskSlug}/environment`, { method: 'DELETE' }).catch(() => undefined);
    setStatus('stopped');
  };

  useEffect(() => teardownTerminal, [teardownTerminal]);

  const isRunning = status === 'running' || status === 'starting';

  return (
    <div className="overflow-hidden rounded-2xl border border-[#252b3b] shadow-[0_12px_32px_-12px_rgba(11,15,25,0.5)]">
      <WindowChrome
        label={`${taskSlug} — sh`}
        live={status === 'running'}
        onStop={status === 'running' ? stop : undefined}
      />

      {isRunning ? (
        <div className="relative bg-[#0b0f19]">
          {status === 'starting' ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b0f19]">
              <Loader2 className="h-6 w-6 animate-spin text-[#00A0FF]" />
              <span className="text-sm font-medium text-white/50">Разворачиваем сервер...</span>
            </div>
          ) : null}
          <div ref={containerRef} className="h-[420px] w-full px-3 py-3" />
        </div>
      ) : (
        <div className="flex h-[420px] flex-col items-center justify-center gap-4 bg-[#0b0f19] px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
            <TerminalIcon className="h-5 w-5 text-white/40" />
          </div>
          <div>
            <p className="font-medium text-white/80">Окружение ещё не запущено</p>
            <p className="mt-1 max-w-xs text-sm text-white/40">
              Поднимем для вас изолированный сервер и дадим прямой доступ к терминалу.
            </p>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            onClick={start}
            className="rounded-xl bg-[#00A0FF] px-5 font-bold text-white hover:bg-[#0090e6]"
          >
            Запустить окружение
          </Button>
        </div>
      )}
    </div>
  );
}
