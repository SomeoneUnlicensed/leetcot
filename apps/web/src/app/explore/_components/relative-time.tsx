'use client';

import { useEffect, useState } from 'react';
import { getRelativeTimeStrict } from '~/utils/relativeTime';

export default function RelativeTime({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{getRelativeTimeStrict(date)}</>;
}
