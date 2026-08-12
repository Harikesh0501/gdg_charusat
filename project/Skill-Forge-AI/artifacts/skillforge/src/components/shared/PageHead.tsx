import type { ReactNode } from 'react';

interface PageHeadProps {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}

export function PageHead({ eyebrow, title, copy, action }: PageHeadProps) {
  return (
    <div className="sf-page-head">
      <div>
        <p className="sf-eyebrow">{eyebrow}</p>
        <h1 className="sf-title">{title}</h1>
        {copy && <p className="sf-subtitle">{copy}</p>}
      </div>
      {action}
    </div>
  );
}
