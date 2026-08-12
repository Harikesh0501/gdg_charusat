import { Check } from 'lucide-react';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { RoadmapPhaseCard } from '@/components/roadmap/RoadmapPhaseCard';
import { useRoadmap } from '@/hooks/use-workspace-data';
import { getRoadmapMeta, getRoadmapPhaseMeta } from '@/services/mock';

/** Phase boundaries are positional: phase 0 gets items[0:2], phase 1 items[2:4], phase 2 items[4:5]. */
const PHASE_SLICES: [number, number][] = [[0, 2], [2, 4], [4, 5]];

export function Roadmap() {
  const { roadmap, toggleRoadmapItem } = useRoadmap();
  const meta = getRoadmapMeta();
  const phases = getRoadmapPhaseMeta();
  const completed = roadmap.filter((item) => item.done).length;
  const completedPercent = (completed / roadmap.length) * 100;

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="A plan that earns its place"
        title="Your roadmap"
        copy="Small, deliberate actions that turn priority gaps into credible evidence."
        action={
          <Pill tone="teal" data-testid="status-roadmap-progress">
            <Check size={12} /> {completed} of {roadmap.length} complete
          </Pill>
        }
      />
      <div className="sf-card sf-card-pad" style={{ marginBottom: 18 }}>
        <div className="sf-section-head">
          <div>
            <h2 className="sf-section-title">{meta.title}</h2>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{meta.description}</div>
          </div>
          <span className="sf-mono" style={{ color: 'hsl(var(--primary))', fontSize: 13 }}>{Math.round(completedPercent)}%</span>
        </div>
        <ProgressBar value={completedPercent} />
      </div>
      <div className="sf-grid sf-grid-2">
        {phases.map((phase, phaseIndex) => {
          const [start, end] = PHASE_SLICES[phaseIndex];
          return (
            <RoadmapPhaseCard
              key={phase.index}
              index={phase.index}
              title={phase.title}
              period={phase.period}
              items={roadmap.slice(start, end)}
              onToggle={toggleRoadmapItem}
            />
          );
        })}
      </div>
    </div>
  );
}
