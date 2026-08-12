import type { CSSProperties, ReactNode } from 'react';

interface GapRowProps {
  name: string;
  meta: string;
  score: ReactNode;
  dotStyle?: CSSProperties;
  'data-testid'?: string;
}

export function GapRow({ name, meta, score, dotStyle, ...rest }: GapRowProps) {
  return (
    <div className="sf-gap-row" {...rest}>
      <span className="sf-gap-dot" style={dotStyle} />
      <div>
        <div className="sf-gap-name">{name}</div>
        <div className="sf-gap-meta">{meta}</div>
      </div>
      <div className="sf-gap-score">{score}</div>
    </div>
  );
}
