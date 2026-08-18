'use client';
import { cn } from '@repo/ui/cn';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

interface MobileNavProps {
  children: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  //blocking scroll on open nav-menu
  useEffect(() => {
    if (mounted && open) {
      const body = document.getElementsByTagName('body')[0];
      body?.classList.add('mobile-nav-active');
    }
    if (mounted && !open) {
      const body = document.getElementsByTagName('body')[0];
      body?.classList.remove('mobile-nav-active');
    }
  }, [open, mounted]);

  return (
    mounted && (
      <>
        <div className="md:hidden">
          {/* Hamburger Icon */}
          <button
            className={cn(
              'hamburger border-border rounded-full border bg-black/[0.02] p-3 duration-300 hover:bg-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A0FF]',
              open ? 'is-active' : '',
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="line mb-2" />
            <span className="line mt-2" />
          </button>
        </div>
        <motion.div
          key={open ? 'open' : 'close'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`border-border fixed inset-x-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-full flex-1 snap-y flex-col gap-5 justify-self-center border-b bg-white p-4 shadow-2xl md:mt-0 md:hidden md:pb-0 ${
            open ? 'block' : 'hidden'
          }`}
        >
          {children}
        </motion.div>
      </>
    )
  );
}
