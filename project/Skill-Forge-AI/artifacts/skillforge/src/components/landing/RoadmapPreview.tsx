import { Check, ListChecks } from 'lucide-react';
import { IconTile } from '@/components/shared/IconTile';
import { getRoadmap, getRoadmapMeta, getRoadmapPhaseMeta } from '@/services/mock';

const PHASE_SLICES: [number, number][] = [[0, 2], [2, 4], [4, 5]];

export function RoadmapPreview() {
  const meta = getRoadmapMeta();
  const phases = getRoadmapPhaseMeta();
  const roadmap = getRoadmap();

  return (
    <section className="sf-landing-section tinted">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">Your roadmap</p>
          <h2 className="sf-landing-h2">A plan you can actually follow.</h2>
          <p className="sf-landing-lede">{meta.title} — {meta.description}</p>
        </div>
        <div className="sf-grid sf-grid-3">
          {phases.map((phase, phaseIndex) => {
            const [start, end] = PHASE_SLICES[phaseIndex];
            const items = roadmap.slice(start, end);
            return (
              <section className="sf-card sf-phase" key={phase.index}>
                <div className="sf-phase-head">
                  <div>
                    <div className="sf-phase-index">PHASE {phase.index}</div>
                    <h3>{phase.title}</h3>
                  </div>
                  <IconTile icon={ListChecks} />
                </div>
                <div className="sf-checklist">
                  {items.map((item) => (
                    <div className="sf-check" style={{ cursor: 'default' }} key={item.id}>
                      <span className="sf-check-mark" style={item.done ? { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' } : undefined}>
                        {item.done && <Check size={13} />}
                      </span>
                      <span className="sf-check-title" style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
