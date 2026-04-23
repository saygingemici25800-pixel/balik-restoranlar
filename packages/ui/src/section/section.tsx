import type { ReactNode } from 'react';

export type SectionPadding = 'sm' | 'md' | 'lg';
export type SectionTone = 'default' | 'muted';

export type SectionProps = {
  padding?: SectionPadding;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
};

const paddings: Record<SectionPadding, string> = {
  sm: 'py-8',
  md: 'py-16',
  lg: 'py-24',
};

const tones: Record<SectionTone, string> = {
  default: '',
  muted: 'bg-muted',
};

export function Section({ padding = 'md', tone = 'default', className, children }: SectionProps) {
  const classes = [paddings[padding], tones[tone], className].filter(Boolean).join(' ');
  return <section className={classes}>{children}</section>;
}
