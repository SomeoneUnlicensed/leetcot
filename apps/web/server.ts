import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { WebSocketServer, type WebSocket } from 'ws';
import * as pty from 'node-pty';
import { prisma } from '@repo/db';
import { reapExpiredEnvironments } from './src/server/environments';

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? '0.0.0.0';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface TerminalMessage {
  type: 'input' | 'resize';
  data?: string;
  cols?: number;
  rows?: number;
}

async function resolveUserFromCookie(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;

  const res = await fetch(`http://127.0.0.1:${port}/api/auth/session`, {
    headers: { cookie: cookieHeader },
  }).catch(() => null);
  if (!res?.ok) return null;

  const session = (await res.json().catch(() => null)) as { user?: { email?: string } } | null;
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({ where: { email: session.user.email } });
}

function attachTerminal(ws: WebSocket, containerName: string) {
  const shell = pty.spawn('docker', ['exec', '-it', containerName, 'sh', '-l'], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
  });

  shell.onData((data) => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  });

  shell.onExit(() => {
    if (ws.readyState === ws.OPEN) ws.close();
  });

  ws.on('message', (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString('utf8')) as TerminalMessage;
      if (msg.type === 'input' && typeof msg.data === 'string') {
        shell.write(msg.data);
      } else if (msg.type === 'resize' && msg.cols && msg.rows) {
        shell.resize(msg.cols, msg.rows);
      }
    } catch {
      // ignore malformed frames
    }
  });

  ws.on('close', () => {
    shell.kill();
  });
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url ?? '/', true));
  });

  const wss = new WebSocketServer({ noServer: true });
  const nextUpgradeHandler = app.getUpgradeHandler();

  server.on('upgrade', (req, socket, head) => {
    const { pathname, query } = parse(req.url ?? '', true);

    if (pathname !== '/ws/terminal') {
      // Not ours — hand it to Next (e.g. its dev-mode HMR websocket).
      nextUpgradeHandler(req, socket, head);
      return;
    }

    wss.handleUpgrade(req, socket, head, async (ws) => {
      const taskSlug = typeof query.taskSlug === 'string' ? query.taskSlug : null;
      if (!taskSlug) {
        ws.close(4000, 'Missing taskSlug');
        return;
      }

      const user = await resolveUserFromCookie(req.headers.cookie);
      if (!user) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      const task = await prisma.debugTask.findUnique({ where: { slug: taskSlug } });
      if (!task) {
        ws.close(4004, 'Task not found');
        return;
      }

      const env = await prisma.taskEnvironment.findUnique({
        where: { taskId_userId: { taskId: task.id, userId: user.id } },
      });
      if (!env || env.status !== 'RUNNING') {
        ws.close(4004, 'No running environment');
        return;
      }

      attachTerminal(ws, env.containerName);
    });
  });

  setInterval(() => {
    reapExpiredEnvironments().catch((error) => {
      console.error('Environment reaper failed:', error);
    });
  }, 60_000);

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
