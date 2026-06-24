'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <main style={{ padding: 24 }}>
          <h1>Что-то пошло не так</h1>
          <p>Мы уже получили отчет об ошибке.</p>
        </main>
      </body>
    </html>
  );
}
