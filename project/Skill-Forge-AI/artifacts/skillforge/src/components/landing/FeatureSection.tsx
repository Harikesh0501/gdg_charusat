import { ClipboardCheck, Gauge, Route as RouteIcon, Search, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const features: { icon: LucideIcon; title: string; copy: string; primary?: boolean }[] = [
  {
    icon: RouteIcon,
    title: 'Personalized Roadmap',
    copy: 'A phased, ordered plan built from your actual gaps — sequenced so each step builds on the last, not a flat list of courses.',
    primary: true,
  },
  { icon: Search, title: 'Skill Gap Analysis', copy: 'See current vs. required proficiency for your target role, with priority made explicit.' },
  { icon: Sparkles, title: 'Smart Recommendations', copy: 'Resources and projects ranked to your gaps, with the reason explained.' },
  { icon: Gauge, title: 'Readiness Tracking', copy: 'A score that updates as you complete real work, not a vanity number.' },
  { icon: ClipboardCheck, title: 'Interview Preparation', copy: 'Practice prompts tied to your target role and the gaps you’re closing.' },
];

export function FeatureSection() {
  return (
    <section className="sf-landing-section tinted">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">What you get</p>
          <h2 className="sf-landing-h2">The concrete plan, not just the analysis.</h2>
        </div>
        <div className="sf-feature-grid">
          {features.map(({ icon: Icon, title, copy, primary }) => (
            <div className={`sf-feature-card ${primary ? 'primary' : ''}`} key={title}>
              <Icon size={primary ? 22 : 18} color="hsl(var(--primary))" />
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
