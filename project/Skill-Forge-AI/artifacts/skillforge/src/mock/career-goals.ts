import { BriefcaseBusiness, PenLine, Target } from 'lucide-react';
import type { CareerGoal } from '@/types/career';

export const careerGoals: CareerGoal[] = [
  { id: 'spd', icon: PenLine, title: 'Senior Product Designer', company: 'Lead craft and product direction', copy: 'Own complex problems, shape systems, and make decisions legible.' },
  { id: 'design-lead', icon: BriefcaseBusiness, title: 'Design Lead', company: 'Grow teams and practice', copy: 'Set quality bars, coach designers, and build a durable practice.' },
  { id: 'pm', icon: Target, title: 'Product Manager', company: 'Lead outcomes and strategy', copy: 'Connect customer insight, business context, and a focused bet.' },
];

export const defaultCareerGoalId = 'spd';
