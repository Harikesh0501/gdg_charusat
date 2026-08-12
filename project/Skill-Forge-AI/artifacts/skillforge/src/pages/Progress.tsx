import { Check, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { BarTrendChart } from '@/components/shared/BarTrendChart';
import { IconTile } from '@/components/shared/IconTile';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { ProgressStatCard } from '@/components/progress/ProgressStatCard';
import { getProgressSummary } from '@/services/mock';

export function Progress() {
  const summary = getProgressSummary();

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Proof of momentum"
        title="Your progress"
        copy="Progress is more than a number. It’s the trail of decisions, practice, and evidence you’ve built."
      />
      <div className="sf-grid sf-grid-3">
        <ProgressStatCard
          label="Readiness today"
          value={summary.readinessToday}
          footer={<Pill tone="teal"><TrendingUp size={12} /> {summary.readinessTrendCopy}</Pill>}
        />
        <ProgressStatCard
          label="Actions completed"
          value={summary.actionsCompleted}
          footer={<span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>of {summary.actionsPlanned} planned actions</span>}
        />
        <ProgressStatCard
          label="Practice streak"
          value={<>{summary.practiceStreakDays} <small style={{ font: '400 13px DM Sans' }}>days</small></>}
          footer={<Pill tone="orange"><Zap size={12} /> Keep the rhythm</Pill>}
        />
      </div>
      <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
        <div className="sf-section-head">
          <h2 className="sf-section-title">Readiness over time</h2>
          <span className="sf-mini-label">Last 6 months</span>
        </div>
        <BarTrendChart
          values={summary.chart.values}
          labels={summary.chart.labels}
          heightMultiplier={2.3}
          ariaLabel="Six month readiness chart"
          style={{ height: 230 }}
        />
      </section>
      <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
        <div className="sf-section-head">
          <h2 className="sf-section-title">Recent signals</h2>
          <Link href="/roadmap" className="sf-link" data-testid="link-progress-roadmap">View roadmap</Link>
        </div>
        {summary.recentSignals.map((event, index) => (
          <div key={event} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: index < summary.recentSignals.length - 1 ? '1px solid hsl(var(--border))' : 0 }}>
            <IconTile icon={Check} size={15} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{event}</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 10, marginTop: 3 }}>{index + 2} days ago · readiness signal added</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
