'use client';

import { usePathname } from 'next/navigation';

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The kiosk leaderboard is meant to be captured full-screen (OBS browser source
  // for the venue projector) — no site chrome should ever show up on top of it.
  if (pathname?.startsWith('/leaderboard/kiosk')) return null;

  return (
    <nav className="border-border/80 supports-[backdrop-filter]:bg-background/90 sticky top-0 z-40 container flex h-16 items-center border-b bg-white text-sm font-medium backdrop-blur-xl">
      {children}
    </nav>
  );
}
