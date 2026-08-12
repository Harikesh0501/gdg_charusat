/**
 * Illustrative-only content for the landing page's personalization section.
 * These are two hypothetical profiles (not real users) used to demonstrate why
 * the same target role produces different roadmaps. Skill and role names are
 * drawn from the app's real taxonomy (`mock/skills.ts`, `mock/career-goals.ts`)
 * rather than invented — only the two example profiles themselves are fictional.
 */
export interface PersonaGap {
  name: string;
  strengths: string[];
  gaps: string[];
}

export const personaComparison: { targetRole: string; profiles: PersonaGap[] } = {
  targetRole: 'Senior Product Designer',
  profiles: [
    { name: 'Profile A', strengths: ['Product strategy', 'Interaction design'], gaps: ['Design systems'] },
    { name: 'Profile B', strengths: ['Research synthesis', 'Facilitation'], gaps: ['Executive storytelling', 'Metrics & experimentation'] },
  ],
};
