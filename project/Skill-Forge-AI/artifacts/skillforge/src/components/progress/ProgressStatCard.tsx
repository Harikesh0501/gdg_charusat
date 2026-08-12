import type { ReactNode } from 'react';

interface ProgressStatCardProps {
  label: string;
  value: ReactNode;
  footer: ReactNode;
}

export function ProgressStatCard({ label, value, footer }: ProgressStatCardProps) {
  return (
    <div className="sf-card sf-card-pad">
      <div className="sf-mini-label">{label}</div>
      <div className="sf-stat-value" style={{ margin: '18px 0 4px' }}>{value}</div>
      {footer}
    </div>
  );
}
