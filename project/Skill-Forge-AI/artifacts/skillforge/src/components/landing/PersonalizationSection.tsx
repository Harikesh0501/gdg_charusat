import { Check, Zap } from 'lucide-react';
import { Pill } from '@/components/shared/Pill';
import { getPersonaComparison } from '@/services/mock';

export function PersonalizationSection() {
  const { targetRole, profiles } = getPersonaComparison();

  return (
    <section className="sf-landing-section">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">Why personalization matters</p>
          <h2 className="sf-landing-h2">The same target doesn't mean the same starting point.</h2>
          <p className="sf-landing-lede">
            Two people can want the same role and need completely different plans.
            SkillForge starts from what you actually know — never a static checklist.
          </p>
        </div>
        <div className="sf-persona-target">
          <span className="sf-mini-label">Same target role</span>
          <div style={{ font: '600 20px "Space Grotesk", sans-serif', marginTop: 6 }}>{targetRole}</div>
        </div>
        <div className="sf-persona-grid">
          {profiles.map((profile) => (
            <div className="sf-card sf-card-pad" key={profile.name}>
              <h3 className="sf-section-title" style={{ marginBottom: 14 }}>{profile.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {profile.strengths.map((skill) => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <Check size={13} color="hsl(var(--primary))" /> {skill}
                  </div>
                ))}
                {profile.gaps.map((skill) => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <Zap size={13} color="hsl(var(--accent))" /> {skill}
                  </div>
                ))}
              </div>
              <Pill tone="orange" style={{ marginTop: 16 }}>
                {profile.gaps.length} priority gap{profile.gaps.length === 1 ? '' : 's'}
              </Pill>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
