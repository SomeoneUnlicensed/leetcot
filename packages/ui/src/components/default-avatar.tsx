import type { ComponentProps } from 'react';
import { cn } from '../cn';

// million-ignore
export function DefaultAvatar(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'font-mono text-[7px] leading-[1] font-bold select-none text-center flex flex-col justify-center items-center w-full h-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-full aspect-square',
        props.className,
      )}
    >
      <div className="-mb-0.5">/\_/\</div>
      <div>( o.o )</div>
    </div>
  );
}
