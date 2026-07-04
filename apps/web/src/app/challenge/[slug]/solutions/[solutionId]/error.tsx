'use client'; // Компоненты ошибок должны быть клиентскими компонентами.

import { Text } from '@repo/ui/components/typography/typography';

export default function Error() {
  return (
    <div className="container flex h-full flex-col items-center justify-center">
      <Text className="mb-6" intent="h2">
        Ой! Мы не смогли найти решение, которое вы искали.
      </Text>
    </div>
  );
}
