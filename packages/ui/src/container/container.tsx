import type { ReactNode } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg';

export type ContainerProps = {
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
};

const sizes: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
};

export function Container({ size = 'md', className, children }: ContainerProps) {
  const classes = ['mx-auto px-6', sizes[size], className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
