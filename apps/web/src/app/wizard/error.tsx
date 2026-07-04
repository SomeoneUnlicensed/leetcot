'use client'; // Компоненты ошибок должны быть клиентскими компонентами.

import { Text } from '@repo/ui/components/typography/typography';
import { Button } from '@repo/ui/components/button';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="container flex h-full flex-col items-center justify-center">
      <Text className="mb-6" intent="h2">
        Что-то пошло не так!
      </Text>
      <Button
        onClick={
          // Пробуем восстановиться и заново отрисовать сегмент.
          () => reset()
        }
      >
        Попробовать снова
      </Button>
    </div>
  );
}
