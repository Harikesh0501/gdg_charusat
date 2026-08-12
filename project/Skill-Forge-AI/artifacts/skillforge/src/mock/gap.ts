import { BarChart3, FileText, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GapSignal {
  icon: LucideIcon;
  title: string;
  copy: string;
}

export const gapWhyItMatters = {
  kicker: 'Why this matters',
  title: 'Your craft is not the constraint.',
  copy: 'The evidence points to a visibility gap: you have strong interaction instincts, but fewer artifacts that show how you connect design decisions to product outcomes and team alignment.',
  tags: ['Evidence-led', 'Role-specific'],
};

export const gapSignals: GapSignal[] = [
  { icon: FileText, title: 'Your resume', copy: 'Mentions systems work, but does not show the outcome.' },
  { icon: UserRound, title: 'Your profile', copy: 'Strong craft signal. Leadership signal is still forming.' },
  { icon: BarChart3, title: 'Role patterns', copy: 'Senior candidates explain decisions with metrics and trade-offs.' },
];
