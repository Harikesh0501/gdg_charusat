import type { InterviewFrameworkStep } from '@/types/interview';

export const interviewPrompts: string[] = [
  'Tell me about a time you changed direction after research.',
  'How did you decide what belonged in the design system?',
  'What metric told you your design was working?',
];

export const interviewFramework: InterviewFrameworkStep[] = [
  { title: 'Context', copy: 'Name the constraint and the people involved.' },
  { title: 'Choice', copy: 'Explain the trade-off you made and why.' },
  { title: 'Consequence', copy: 'Close with what changed and what you learned.' },
];
