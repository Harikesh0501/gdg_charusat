import type { Skill } from '@/types/skill';

export const seedSkills: Skill[] = [
  { id: 1, name: 'Product strategy', category: 'Strategy', level: 4, target: 5, state: 'Strong foundation' },
  { id: 2, name: 'Interaction design', category: 'Craft', level: 4, target: 5, state: 'Strong foundation' },
  { id: 3, name: 'Design systems', category: 'Craft', level: 3, target: 5, state: 'Priority gap' },
  { id: 4, name: 'Research synthesis', category: 'Discovery', level: 4, target: 4, state: 'Role ready' },
  { id: 5, name: 'Executive storytelling', category: 'Influence', level: 2, target: 4, state: 'Priority gap' },
  { id: 6, name: 'Metrics & experimentation', category: 'Product thinking', level: 2, target: 4, state: 'Priority gap' },
  { id: 7, name: 'Facilitation', category: 'Influence', level: 3, target: 4, state: 'Developing' },
  { id: 8, name: 'Accessibility', category: 'Craft', level: 3, target: 4, state: 'Developing' },
];

export const skillCategories = ['Strategy', 'Craft', 'Discovery', 'Influence', 'Product thinking'];
