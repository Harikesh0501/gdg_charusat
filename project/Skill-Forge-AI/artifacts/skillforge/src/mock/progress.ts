export interface ProgressSummary {
  readinessToday: number;
  readinessTrendCopy: string;
  actionsCompleted: number;
  actionsPlanned: number;
  practiceStreakDays: number;
  chart: {
    values: number[];
    labels: string[];
  };
  recentSignals: string[];
}

export const progressSummary: ProgressSummary = {
  readinessToday: 72,
  readinessTrendCopy: '+6 in 90 days',
  actionsCompleted: 11,
  actionsPlanned: 24,
  practiceStreakDays: 9,
  chart: {
    values: [48, 52, 57, 61, 66, 72],
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Now'],
  },
  recentSignals: [
    'Completed a design systems audit',
    'Updated target role to Senior Product Designer',
    'Added research synthesis evidence',
  ],
};
