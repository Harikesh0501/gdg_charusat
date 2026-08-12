import { TrendingUp } from 'lucide-react';
import { Pill } from '@/components/shared/Pill';
import { ProgressStatCard } from '@/components/progress/ProgressStatCard';
import { getDashboardSummary, getRoadmap } from '@/services/mock';

export function ReadinessPreview() {
  const summary = getDashboardSummary();
  const roadmap = getRoadmap();
  const roadmapProgress = Math.round((roadmap.filter((item) => item.done).length / roadmap.length) * 100);

  return (
    <section className="sf-landing-section">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">The outcome</p>
          <h2 className="sf-landing-h2">A readiness score you can trust, because you can see what's behind it.</h2>
        </div>
        <div className="sf-grid sf-grid-3">
          <ProgressStatCard
            label="Career readiness"
            value={`${summary.readiness}%`}
            footer={<Pill tone="teal"><TrendingUp size={12} /> {summary.readinessTrend}</Pill>}
          />
          <ProgressStatCard
            label="Roadmap progress"
            value={`${roadmapProgress}%`}
            footer={<span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>{roadmap.filter((item) => item.done).length} of {roadmap.length} actions complete</span>}
          />
          <ProgressStatCard
            label="Priority gaps remaining"
            value={summary.priorityGapsCount}
            footer={<span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>{summary.priorityGapsCopy}</span>}
          />
        </div>
      </div>
    </section>
  );
}
