import type { CSSProperties } from 'react';

interface BarTrendChartProps {
  values: number[];
  labels: string[];
  heightMultiplier: number;
  ariaLabel: string;
  style?: CSSProperties;
}

export function BarTrendChart({ values, labels, heightMultiplier, ariaLabel, style }: BarTrendChartProps) {
  const lastIndex = values.length - 1;
  return (
    <div className="sf-chart" style={style} aria-label={ariaLabel}>
      {values.map((value, index) => (
        <div
          className="sf-bar-wrap"
          key={labels[index] + String(index)}
          title={labels[index] ? `${labels[index]}: ${value}` : String(value)}
        >
          <div className={`sf-bar ${index === lastIndex ? 'current' : ''}`} style={{ height: `${value * heightMultiplier}px` }} />
          <span className="sf-bar-label">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}
