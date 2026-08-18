'use client';

import '@xterm/xterm/css/xterm.css';
import { Button } from '@repo/ui/components/button';
import { useCallback, useEffect, useRef, useState } from 'react';

type EnvStatus = 'error' | 'idle' | 'running' | 'starting' | 'stopped';

export function TaskTerminal({ taskSlug }: { taskSlug: string }) {
  const [status, setStatus] = useState<EnvStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const termRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fitAddonRef = useRef<any>(null);

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
      fontSize: 13,
      theme: { background: '#131722' },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/terminal?taskSlug=${taskSlug}`);
    wsRef.current = ws;

    ws.onmessage = (event) => term.write(event.data as string);
    ws.onclose = () => {
      term.write('\r\n\x1b[31mСоединение закрыто.\x1b[0m\r\n');
    };
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
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

  if (status === 'idle' || status === 'stopped' || status === 'error') {
    return (
      <div className="flex flex-col gap-3">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button
          onClick={start}
          className="w-fit rounded-xl bg-[#00A0FF] font-bold text-white hover:bg-[#0090e6]"
        >
          Запустить окружение
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#131722]/60">
          {status === 'starting' ? 'Запускаем сервер...' : 'Терминал подключён'}
        </span>
        <Button
          onClick={stop}
          variant="outline"
          className="border-border h-8 rounded-lg text-xs"
        >
          Остановить
        </Button>
      </div>
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-xl bg-[#131722] p-2"
      />
    </div>
  );
}
