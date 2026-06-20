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
        'flex aspect-square h-full w-full select-none items-center justify-center rounded-full border',
        variant.style,
        className,
      )}
    >
      <svg viewBox="0 0 100 36" className="h-full w-full p-[18%]" aria-hidden="true">
        <text
          x="50"
          y="16"
          textLength="90"
          lengthAdjust="spacingAndGlyphs"
          textAnchor="middle"
          fontFamily="Consolas, Monaco, 'Courier New', monospace"
          fontWeight="900"
          fontSize="16"
          fill="currentColor"
        >
          /\_/\
        </text>
        <text
          x="50"
          y="33"
          textLength="90"
          lengthAdjust="spacingAndGlyphs"
          textAnchor="middle"
          fontFamily="Consolas, Monaco, 'Courier New', monospace"
          fontWeight="900"
          fontSize="16"
          fill="currentColor"
        >
          {variant.face}
        </text>
      </svg>
    </div>
  );
}

export { Avatar, AvatarFallback, AvatarImage, DefaultAvatar };
