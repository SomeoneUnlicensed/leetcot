'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';
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
function DefaultAvatar(props: ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      shapeRendering="auto"
      width={50}
      height={50}
      {...props}
    >
      <circle cx="100" cy="100" r="100" fill="#FFB800" />
      
      {/* Head */}
      <circle cx="100" cy="110" r="60" fill="#FFA500" />
      
      {/* Left ear */}
      <path d="M 60 60 Q 40 50 35 75 Q 45 60 60 65 Z" fill="#FFA500" />
      
      {/* Right ear */}
      <path d="M 140 60 Q 160 50 165 75 Q 155 60 140 65 Z" fill="#FFA500" />
      
      {/* Inner left ear */}
      <path d="M 58 68 Q 50 65 48 75 Q 52 70 58 72 Z" fill="#FFD99D" />
      
      {/* Inner right ear */}
      <path d="M 142 68 Q 150 65 152 75 Q 148 70 142 72 Z" fill="#FFD99D" />
      
      {/* Left eye */}
      <circle cx="80" cy="95" r="6" fill="#000" />
      <circle cx="80" cy="93" r="2" fill="#fff" />
      
      {/* Right eye */}
      <circle cx="120" cy="95" r="6" fill="#000" />
      <circle cx="120" cy="93" r="2" fill="#fff" />
      
      {/* Nose */}
      <path d="M 100 110 L 98 118 L 102 118 Z" fill="#FF69B4" />
      
      {/* Mouth */}
      <path d="M 100 118 Q 90 125 80 123" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 100 118 Q 110 125 120 123" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* Left whisker 1 */}
      <line x1="60" y1="105" x2="30" y2="100" stroke="#000" strokeWidth="1.5" />
      {/* Left whisker 2 */}
      <line x1="60" y1="115" x2="30" y2="120" stroke="#000" strokeWidth="1.5" />
      
      {/* Right whisker 1 */}
      <line x1="140" y1="105" x2="170" y2="100" stroke="#000" strokeWidth="1.5" />
      {/* Right whisker 2 */}
      <line x1="140" y1="115" x2="170" y2="120" stroke="#000" strokeWidth="1.5" />
    </svg>
  );
}

export { Avatar, AvatarFallback, AvatarImage, DefaultAvatar };
