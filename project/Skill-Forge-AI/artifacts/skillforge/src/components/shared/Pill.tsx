import type { CSSProperties, ReactNode } from 'react';

interface PillProps {
  tone: 'teal' | 'orange';
  children: ReactNode;
  style?: CSSProperties;
  'data-testid'?: string;
}

export function Pill({ tone, children, style, ...rest }: PillProps) {
  return (
    <span className={`sf-pill ${tone}`} style={style} {...rest}>
      {children}
    </span>
  );
}
