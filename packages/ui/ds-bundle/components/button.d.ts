import type * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'ghost' | 'link' | 'outline' | 'secondary';
  size?: 'default' | 'icon' | 'lg' | 'sm';
  asChild?: boolean;
}

declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLButtonElement>
>;

export { Button, type ButtonProps };
