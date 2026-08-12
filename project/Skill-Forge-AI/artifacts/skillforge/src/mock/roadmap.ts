import type { RoadmapItem, RoadmapPhaseMeta } from '@/types/roadmap';

export const seedRoadmap: RoadmapItem[] = [
  { id: 1, title: 'Audit a live design system', detail: 'Map tokens, contribution flow, and adoption signals from a product you know.', time: '45 min', done: true },
  { id: 2, title: 'Build an experimentation brief', detail: 'Turn one product question into a measurable hypothesis and decision framework.', time: '60 min', done: true },
  { id: 3, title: 'Practice an executive narrative', detail: 'Record a 5-minute walkthrough that connects customer evidence to a choice.', time: '30 min', done: false },
  { id: 4, title: 'Publish a systems case study', detail: 'Show the constraint, the trade-off, and what changed after launch.', time: '2 hr', done: false },
  { id: 5, title: 'Run a cross-functional critique', detail: 'Facilitate a critique with a clear decision to make at the end.', time: '45 min', done: false },
];

/** Roadmap items are grouped into phases by slice position: [0,2), [2,4), [4,5). */
export const roadmapPhaseMeta: RoadmapPhaseMeta[] = [
  { index: '01', title: 'Make the invisible visible', period: 'Week 1–2 · Build the signal' },
  { index: '02', title: 'Practice the senior signal', period: 'Week 3–4 · Rehearse the signal' },
  { index: '03', title: 'Package your evidence', period: 'Week 5–6 · Share the signal' },
];

export const roadmapTitle = 'Senior Product Designer · 6 week plan';
export const roadmapDescription = 'Focused on systems thinking, product evidence, and influence.';
