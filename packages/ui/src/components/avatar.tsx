'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';
import { cn } from '../cn';

const Avatar = ({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
);

const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image className={cn('aspect-square h-full w-full', className)} {...props} />
);

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
);

// million-ignore
function DefaultAvatar(props: React.ComponentProps<'div'>) {
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

export { Avatar, AvatarFallback, AvatarImage, DefaultAvatar };
