import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import os from 'node:os';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { code, tests, language } = await req.json();

    if (!language || !code) {
      return NextResponse.json(
        { success: false, error: 'Мяу! Переданы не все параметры.' },
        { status: 400 },
      );
    }

    const isPython = language.toLowerCase() === 'python';
    const isJS = language.toLowerCase() === 'javascript';

    if (!isPython && !isJS) {
      return NextResponse.json({
        success: false,
        error: `Исполнение для языка ${language} пока не реализовано`,
      });
    }

    // Создаем уникальную временную папку для этой попытки
    const runId = uuidv4();
    const tmpDir = path.join(os.tmpdir(), `litkot-run-${runId}`);

    await mkdir(tmpDir, { recursive: true });

    // Склеиваем код пользователя и тесты.
    // В идеале тесты должны быть отдельным файлом, который импортирует решение,
    // но для простых алгоритмических задач склейка работает отлично и быстро.
    const fullCode = `${code}\n\n${tests}`;
    const fileName = isPython ? 'main.py' : 'main.js';
    const filePath = path.join(tmpDir, fileName);
    await writeFile(filePath, fullCode);

    // FIX FOR WINDOWS: Docker volume mounts require forward slashes, even on Windows
    // Otherwise `exec` will choke on escaped characters or Docker will fail to mount.
    const normalizedTmpDir = tmpDir.replace(/\\/g, '/');

    /*
      СИСТЕМА БЕЗОПАСНОГО ИСПОЛНЕНИЯ (СУПЕР ЭКОНОМИЧНАЯ):
      Вместо подъема тяжелого контейнера на каждый запрос, мы используем легковесный python:3.11-alpine или node:20-alpine.
      Для продакшена (чтобы было "в одном контейнере без доступа к друг другу") нужно будет поднять
      один долгий контейнер с HTTP-сервером, который будет плодить процессы через `nsjail` или `isolate`.
      
      Сейчас мы используем `docker run --rm`:
      --rm: удаляет контейнер сразу после выполнения.
      --network none: полный запрет на интернет (защита от скачивания малвари).
      -m 128m: лимит памяти (защита от утечек и бомб).
      --cpus 0.5: лимит процессора.
      -v ...: монтируем только папку с текущим кодом.
    */
    const cmd = isPython
      ? `docker run --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code python:3.11-alpine python main.py`
      : `docker run --rm --network none -m 128m --cpus 0.5 -v "${normalizedTmpDir}:/code" -w /code node:20-alpine node main.js`;

    try {
      // Таймаут 5 секунд на выполнение кода
      const { stdout, stderr } = await execAsync(cmd, { timeout: 5000 });
      return NextResponse.json({ success: true, output: stdout, error: stderr });
    } catch (execError: unknown) {
      const err = execError as { killed?: boolean; stderr?: string; stdout?: string };
      if (err.killed) {
        return NextResponse.json({
          success: false,
          error: 'Time Limit Exceeded (Код выполнялся дольше 5 секунд)',
        });
      }

      // Если код упал с синтаксической ошибкой или не прошел тесты (exit code != 0)
      return NextResponse.json({
        success: false,
        error: err.stderr || 'Ошибка выполнения тестов',
        output: err.stdout,
      });
    } finally {
      // Обязательная очистка файловой системы
      await rm(tmpDir, { recursive: true, force: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Execution API Error:', err);
    return NextResponse.json(
      { success: false, error: `Внутренняя ошибка песочницы: ${err.message}` },
      { status: 500 },
    );
  }
}
