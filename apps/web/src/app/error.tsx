'use client';

import { useEffect } from 'react';
import { Button } from '@repo/ui/components/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Что-то пошло не так!</h2>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
        </p>
        {Boolean(error.digest) && (
          <p className="text-muted-foreground font-mono text-xs">ID ошибки: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          На главную
        </Button>
        <Button onClick={() => reset()}>Попробовать снова</Button>
      </div>
    </div>
  );
}
