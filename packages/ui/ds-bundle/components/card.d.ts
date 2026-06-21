import type * as React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

declare const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;
declare const CardHeader: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;
declare const CardTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>
>;
declare const CardDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
>;
declare const CardContent: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;
declare const CardFooter: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, type CardProps };
