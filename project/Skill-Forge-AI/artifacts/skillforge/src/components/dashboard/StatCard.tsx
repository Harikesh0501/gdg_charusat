import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  testId: string;
  footer: ReactNode;
}

export function StatCard({ label, icon: Icon, value, testId, footer }: StatCardProps) {
  return (
    <div className="sf-card sf-stat">
      <div className="sf-stat-top">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <div className="sf-stat-value" data-testid={testId}>{value}</div>
      {footer}
    </div>
  );
}
