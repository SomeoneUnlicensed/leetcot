'use client';

import '@xterm/xterm/css/xterm.css';
import { Button } from '@repo/ui/components/button';
import { Loader2, Square, Terminal as TerminalIcon } from '@repo/ui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';

type EnvStatus = 'error' | 'idle' | 'running' | 'starting' | 'stopped';

const TerminalHeader = ({
  label,
  live,
  onStop,
}: {
  label: string;
  live: boolean;
  onStop?: () => void;
}) => (
  <div className="flex items-center gap-2.5 border-b border-white/5 bg-[#1a2030] px-5 py-3.5">
    <TerminalIcon className="h-4 w-4 shrink-0 text-[#00A0FF]" />
    <span className="truncate font-mono text-xs text-white/50">{label}</span>
    <div className="ml-auto flex items-center gap-3">
      {live ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#00A0FF]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00A0FF]" />
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
        background: '#131722',
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
    <div className="w-full overflow-hidden border-y border-[#252b3b]">
      <TerminalHeader
        label={`${taskSlug} — sh`}
        live={status === 'running'}
        onStop={status === 'running' ? stop : undefined}
      />

      {isRunning ? (
        <div className="relative bg-[#131722]">
          {status === 'starting' ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#131722]">
              <Loader2 className="h-6 w-6 animate-spin text-[#00A0FF]" />
              <span className="text-sm text-white/50">Разворачиваем сервер...</span>
            </div>
          ) : null}
          <div ref={containerRef} className="h-[92vh] min-h-[720px] w-full px-6 py-4" />
        </div>
      ) : (
        <div className="flex h-[92vh] min-h-[720px] flex-col items-center justify-center gap-4 bg-[#131722] px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <TerminalIcon className="h-7 w-7 text-white/30" />
          </div>
          <div>
            <p className="text-lg font-medium text-white/70">Окружение не запущено</p>
            <p className="mt-1 text-sm text-white/40">
              Запустите сервер, чтобы получить реальный интерактивный доступ по shell.
            </p>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            onClick={start}
            className="mt-2 rounded-lg bg-[#00A0FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0090e6]"
          >
            Запустить окружение
          </Button>
        </div>
      )}
    </div>
  );
}
