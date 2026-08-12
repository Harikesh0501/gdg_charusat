import type { LucideIcon } from 'lucide-react';

export interface Recommendation {
  icon: LucideIcon;
  title: string;
  tag: string;
  reason: string;
}

export type RecommendationCategory = 'Resources' | 'Projects' | 'Certifications';

export type RecommendationsByCategory = Record<RecommendationCategory, Recommendation[]>;
