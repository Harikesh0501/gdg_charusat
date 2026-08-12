import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import { GapRow } from '@/components/shared/GapRow';
import { getDashboardSummary, getSkills } from '@/services/mock';

export function Hero() {
  const summary = getDashboardSummary();
  const skills = getSkills();
  const priorityGaps = skills.filter((skill) => skill.state === 'Priority gap').slice(0, 3);

  return (
    <section className="sf-hero sf-landing-container" id="product">
      <div className="sf-hero-copy">
        <p className="sf-hero-eyebrow">Evidence-based career intelligence</p>
        <h1>Build the career path that fits you.</h1>
        <p className="sf-hero-copy-text">
          SkillForge looks at your experience, your target role, and the gap between them —
          then builds a roadmap that's actually yours, not a generic checklist.
        </p>
        <div className="sf-hero-actions">
          <Link href="/onboarding" className="sf-button sf-button-primary" data-testid="link-hero-get-started">
            Get Started <ArrowRight size={15} />
          </Link>
          <Link href="/signin" className="sf-button sf-button-ghost" data-testid="link-hero-signin">
            Sign In
          </Link>
        </div>
      </div>
      <div className="sf-hero-preview">
        <div className="sf-card sf-readiness" style={{ marginBottom: 14 }}>
          <div className="sf-readiness-label">Career readiness</div>
          <div className="sf-readiness-number" data-testid="text-hero-readiness">
            {summary.readiness}<small> / 100</small>
          </div>
          <div className="sf-readiness-trend"><TrendingUp size={14} /> {summary.readinessTrend}</div>
        </div>
        <div className="sf-card sf-card-pad">
          <div className="sf-section-head">
            <h2 className="sf-section-title" style={{ fontSize: 14 }}>Priority gaps</h2>
            <span className="sf-mini-label">{summary.priorityGapsCount} identified</span>
          </div>
          <div className="sf-gap-list">
            {priorityGaps.map((skill) => (
              <GapRow
                key={skill.id}
                name={skill.name}
                meta={`Current ${skill.level}/5 · Target ${skill.target}/5`}
                score={`${skill.target - skill.level} lvl`}
              />
            ))}
          </div>
          <div className="sf-action-kicker" style={{ marginTop: 14 }}>Next up</div>
          <strong style={{ display: 'block', marginTop: 4, fontSize: 13 }}>{summary.nextAction.title}</strong>
        </div>
      </div>
    </section>
  );
}
