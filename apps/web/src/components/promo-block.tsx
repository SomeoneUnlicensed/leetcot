import { cn } from '@repo/ui/cn';
import type { ReactNode } from 'react';

// Глобальный переключатель для рекламных/информационных блоков.
// Когда ты утвердишь места, просто поменяй это значение на false.
export const ENABLE_PROMO_BLOCKS = false;

interface PromoBlockProps {
  text?: string;
  variant?: 'banner' | 'compact' | 'in-feed' | 'sidebar';
  className?: string;
  children?: ReactNode;
  forceShow?: boolean; // Позволяет точечно включать этот блок, даже если глобально они отключены (например, для "Скоро новая функция!")
}

export function PromoBlock({
  text = 'ИНФОРМАЦИЯ',
  variant = 'in-feed',
  className,
  children,
  forceShow = false,
}: PromoBlockProps) {
  if (!ENABLE_PROMO_BLOCKS && !forceShow) return null;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-zinc-600/50 bg-zinc-900/40 p-4 text-sm font-bold tracking-widest text-zinc-500',
        variant === 'banner' &&
          'z-50 min-h-[48px] w-full rounded-none border-x-0 border-t-0 bg-zinc-950/80',
        variant === 'in-feed' && 'my-4 min-h-[120px] w-full rounded-xl',
        variant === 'sidebar' && 'my-4 min-h-[250px] w-full rounded-xl',
        variant === 'compact' && 'my-2 min-h-[60px] w-full rounded-lg text-xs',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
      <span className="relative z-10">{children ? children : text}</span>
    </div>
  );
}
