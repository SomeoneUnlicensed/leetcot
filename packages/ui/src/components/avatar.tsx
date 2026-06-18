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

interface DefaultAvatarProps extends React.ComponentProps<'div'> {
  username?: string | null;
}

// million-ignore
function DefaultAvatar({ username, className, ...props }: DefaultAvatarProps) {
  const getAvatarIndex = (name: string | null | undefined) => {
    if (!name) return 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return hash % 5;
  };

  const index = getAvatarIndex(username);

  const variants = [
    {
      face: '( o.o )',
      style: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      face: '( =^.^= )',
      style: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      face: '( -.- )',
      style: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      face: '( >.< )',
      style: 'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      face: '( o_o )',
      style: 'border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ];

  const variant = variants[index] ?? variants[0]!;

  return (
    <div
      {...props}
      className={cn(
        'flex aspect-square h-full w-full select-none flex-col items-center justify-center rounded-full border text-center font-mono text-[7px] font-bold leading-[1]',
        variant.style,
        className,
      )}
    >
      <div className="-mb-0.5">/\_/\</div>
      <div>{variant.face}</div>
    </div>
  );
}

export { Avatar, AvatarFallback, AvatarImage, DefaultAvatar };
