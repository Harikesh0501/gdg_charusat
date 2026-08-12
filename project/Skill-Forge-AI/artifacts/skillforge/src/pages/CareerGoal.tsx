import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { IconTile } from '@/components/shared/IconTile';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { getCareerGoals, getDefaultCareerGoalId } from '@/services/mock';

export function CareerGoal() {
  const goals = getCareerGoals();
  const [selected, setSelected] = useState(getDefaultCareerGoalId());
  const [saved, setSaved] = useState(false);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Direction creates leverage"
        title="Choose your next role"
        copy="Your goal tunes every comparison, recommendation, and practice prompt in SkillForge."
      />
      <div className="sf-grid sf-grid-3">
        {goals.map(({ id, icon, title, company, copy }) => (
          <button
            type="button"
            className={`sf-goal-option ${selected === id ? 'selected' : ''}`}
            key={id}
            onClick={() => { setSelected(id); setSaved(false); }}
            data-testid={`button-goal-${id}`}
            aria-pressed={selected === id}
          >
            <IconTile icon={icon} size={18} />
            <h3>{title}</h3>
            <div style={{ color: 'hsl(var(--primary))', fontSize: 11, fontWeight: 600 }}>{company}</div>
            <p style={{ marginTop: 12 }}>{copy}</p>
            {selected === id && (
              <Pill tone="teal" style={{ marginTop: 16 }}><Check size={12} /> Current target</Pill>
            )}
          </button>
        ))}
      </div>
      <div className="sf-card sf-card-pad" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <div className="sf-mini-label">Selected target</div>
          <strong style={{ display: 'block', marginTop: 6, font: '600 18px Space Grotesk' }}>
            {goals.find((goal) => goal.id === selected)?.title}
          </strong>
        </div>
        <button type="button" className="sf-button sf-button-primary" onClick={() => setSaved(true)} data-testid="button-save-goal">
          {saved ? <><Check size={15} /> Goal saved</> : <>Save this direction <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}
