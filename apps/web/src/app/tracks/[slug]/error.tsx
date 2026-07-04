'use client'; // Компоненты ошибок должны быть клиентскими компонентами.

import { Button } from '@repo/ui/components/button';
import { Text } from '@repo/ui/components/typography/typography';
import Link from 'next/link';

export default function Error() {
  return (
    <div className="container flex h-full flex-col items-center justify-center">
      <Text className="mb-6" intent="h2">
        Ой! Мы не смогли найти трек, который вы искали.
      </Text>
      <Link href="/tracks">
        <Button>К списку треков</Button>
      </Link>
    </div>
  );
}
