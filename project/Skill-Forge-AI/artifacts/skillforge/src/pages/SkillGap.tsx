import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { GapRow } from '@/components/shared/GapRow';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { useSkills } from '@/hooks/use-workspace-data';
import { getGapContext } from '@/services/mock';

export function SkillGap() {
  const skills = useSkills();
  const { whyItMatters, signals } = getGapContext();
  const gaps = skills.filter((skill) => skill.target > skill.level);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Explainable by design"
        title="Where the distance lives"
        copy="Not a score to chase. A clear explanation of what changes between your current evidence and the role you want."
        action={
          <Link href="/recommendations" className="sf-button sf-button-primary" data-testid="button-view-recommendations">
            View recommendations <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="sf-grid sf-grid-2">
        <section className="sf-card sf-card-pad">
          <div className="sf-section-head">
            <h2 className="sf-section-title">Priority gaps</h2>
            <span className="sf-mini-label">5 identified</span>
          </div>
          {gaps.map((skill, index) => (
            <GapRow
              key={skill.id}
              data-testid={`analysis-gap-${skill.id}`}
              name={skill.name}
              meta={`Evidence level ${skill.level}/5 → role signal ${skill.target}/5`}
              score="High"
              dotStyle={{ background: index < 2 ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
            />
          ))}
        </section>
        <section className="sf-card sf-card-pad" style={{ background: 'hsl(37 66% 90%)', borderColor: 'hsl(36 48% 79%)' }}>
          <div className="sf-action-kicker"><Sparkles size={14} /> {whyItMatters.kicker}</div>
          <h2 className="sf-action-title" style={{ maxWidth: 390 }}>{whyItMatters.title}</h2>
          <p className="sf-action-copy" style={{ maxWidth: 420 }}>{whyItMatters.copy}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 22 }}>
            {whyItMatters.tags.map((tag) => <Pill key={tag} tone="orange">{tag}</Pill>)}
          </div>
        </section>
      </div>
      <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
        <div className="sf-section-head">
          <h2 className="sf-section-title">How we got here</h2>
          <span className="sf-mini-label">3 signals</span>
        </div>
        <div className="sf-grid sf-grid-3">
          {signals.map(({ icon: Icon, title, copy }) => (
            <div key={title} style={{ padding: 16, background: 'hsl(var(--background))', borderRadius: 10 }}>
              <Icon size={17} color="hsl(var(--primary))" />
              <h3 style={{ font: '600 14px Space Grotesk', margin: '11px 0 6px' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 11, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
