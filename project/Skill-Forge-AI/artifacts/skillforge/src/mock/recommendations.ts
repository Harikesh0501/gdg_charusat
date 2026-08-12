import { Award, BookOpen, BriefcaseBusiness, GraduationCap, PenLine, Play } from 'lucide-react';
import type { RecommendationsByCategory } from '@/types/recommendation';

export const recommendationsByCategory: RecommendationsByCategory = {
  Resources: [
    { icon: BookOpen, title: 'The Product Strategy Playbook', tag: 'Reading · 18 min', reason: 'Build language for connecting a design decision to the product bet behind it.' },
    { icon: Play, title: 'Storytelling with data', tag: 'Watch · 24 min', reason: 'A practical frame for making your next critique land with leadership.' },
  ],
  Projects: [
    { icon: PenLine, title: 'Experiment brief sprint', tag: 'Project · 60 min', reason: 'The fastest way to turn your product-thinking gap into evidence.' },
    { icon: BriefcaseBusiness, title: 'System contribution map', tag: 'Project · 45 min', reason: 'Shows senior-level systems thinking without requiring a new product.' },
  ],
  Certifications: [
    { icon: GraduationCap, title: 'NN/g UX Certification', tag: 'Certification · Optional', reason: 'A useful external signal if you want to formalize your research practice.' },
    { icon: Award, title: 'Reforge Product Strategy', tag: 'Program · Advanced', reason: 'Best fit when your next role leans heavily into product direction.' },
  ],
};
