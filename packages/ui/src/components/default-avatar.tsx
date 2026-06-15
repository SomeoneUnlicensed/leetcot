import type { ComponentProps } from 'react';
import { cn } from '../cn';

// million-ignore
export function DefaultAvatar(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'flex aspect-square h-full w-full select-none flex-col items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-center font-mono text-[7px] font-bold leading-[1] text-amber-600 dark:text-amber-400',
        props.className,
      )}
    >
      <div className="-mb-0.5">/\_/\</div>
      <div>( o.o )</div>
    </div>
  );
}
