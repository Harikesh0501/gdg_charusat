export interface DashboardSummary {
  greetingDate: string;
  greetingName: string;
  targetRole: string;
  readiness: number;
  readinessTrend: string;
  masteredSkills: number;
  masteredSkillsCopy: string;
  priorityGapsCount: number;
  priorityGapsCopy: string;
  nextAction: {
    kicker: string;
    title: string;
    copy: string;
    ctaLabel: string;
  };
  readinessTrendChart: {
    values: number[];
    labels: string[];
    trendCopy: string;
  };
}

/**
 * Some values here (masteredSkills, priorityGapsCount) are illustrative dashboard
 * copy in the current mock and are intentionally NOT derived from the live skills
 * list, matching the original App.tsx behavior exactly.
 */
export const dashboardSummary: DashboardSummary = {
  greetingDate: 'Monday, 14 October 2024',
  greetingName: 'Jordan',
  targetRole: 'Senior Product Designer',
  readiness: 72,
  readinessTrend: '+6 points since August',
  masteredSkills: 18,
  masteredSkillsCopy: 'Across 6 capability areas',
  priorityGapsCount: 5,
  priorityGapsCopy: 'Two are blocking your next move',
  nextAction: {
    kicker: 'Best next action',
    title: 'Make your product thinking visible.',
    copy: 'A concise experimentation brief will close your largest evidence gap and give you a story to bring into interviews.',
    ctaLabel: 'Start the brief',
  },
  readinessTrendChart: {
    values: [54, 58, 61, 64, 66, 68, 71, 72],
    labels: ['Jul', '', 'Aug', '', 'Sep', '', 'Oct', 'Now'],
    trendCopy: '+6 this quarter',
  },
};
