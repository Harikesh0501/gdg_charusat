export const resumeProcessingCopy = {
  reading: 'Looking for role signals, not keyword counts…',
  complete: '12 skills and 4 evidence signals found.',
};

/** Staged progress labels shown while a resume is being processed. */
export const resumeProcessingStages: string[] = [
  'Resume uploaded',
  'Reading resume',
  'Extracting skills',
  'Building your profile',
];

export const resumeFindings: [string, string][] = [
  ['12', 'Skills detected'],
  ['4', 'Evidence signals'],
  ['3', 'Areas to clarify'],
];
