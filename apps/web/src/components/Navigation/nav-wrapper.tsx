'use client';

export function NavWrapper({ children }: { children: React.ReactNode }) {
  return (
    <nav className="border-border/80 supports-[backdrop-filter]:bg-background/90 sticky top-0 z-40 container flex h-16 items-center border-b bg-white text-sm font-medium backdrop-blur-xl">
      {children}
    </nav>
  );
}
