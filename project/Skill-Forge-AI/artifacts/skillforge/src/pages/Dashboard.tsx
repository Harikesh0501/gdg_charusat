import { ArrowRight, Award, Lightbulb, Route as RouteIcon, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { BarTrendChart } from '@/components/shared/BarTrendChart';
import { GapRow } from '@/components/shared/GapRow';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { useRoadmap, useSkills } from '@/hooks/use-workspace-data';
import { getDashboardSummary } from '@/services/mock';

export function Dashboard() {
  const skills = useSkills();
  const { roadmap } = useRoadmap();
  const summary = getDashboardSummary();

  const priorityGaps = skills.filter((skill) => skill.state === 'Priority gap');
  const done = roadmap.filter((item) => item.done).length;
  const roadmapProgress = Math.round((done / roadmap.length) * 100);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow={summary.greetingDate}
        title={`Good morning, ${summary.greetingName}.`}
        copy={`Here’s the clearest view of your path to ${summary.targetRole}.`}
        action={
          <Link href="/roadmap" className="sf-button sf-button-primary" data-testid="button-open-roadmap">
            Open my roadmap <ArrowRight size={15} />
          </Link>
        }
      />
      <section className="sf-stat-grid">
        <div className="sf-card sf-readiness">
          <div className="sf-readiness-label">Readiness for your target role</div>
          <div className="sf-readiness-number" data-testid="text-readiness">
            {summary.readiness}<small> / 100</small>
          </div>
          <div className="sf-readiness-trend"><TrendingUp size={14} /> {summary.readinessTrend}</div>
        </div>
        <StatCard
          label="Mastered skills"
          icon={Award}
          value={summary.masteredSkills}
          testId="text-mastered-skills"
          footer={<div className="sf-stat-copy">{summary.masteredSkillsCopy}</div>}
        />
        <StatCard
          label="Priority gaps"
          icon={Zap}
          value={summary.priorityGapsCount}
          testId="text-priority-gaps"
          footer={<div className="sf-stat-copy">{summary.priorityGapsCopy}</div>}
        />
        <StatCard
          label="Roadmap progress"
          icon={RouteIcon}
          value={<>{roadmapProgress}<small style={{ fontSize: 16 }}>%</small></>}
          testId="text-roadmap-progress"
          footer={<ProgressBar value={roadmapProgress} />}
        />
      </section>
      <div className="sf-grid sf-grid-2">
        <section className="sf-card sf-card-pad">
          <div className="sf-section-head">
            <h2 className="sf-section-title">Your top gaps</h2>
            <Link href="/gap" className="sf-link" data-testid="link-see-gap-analysis">
              See analysis <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div className="sf-gap-list">
            {priorityGaps.slice(0, 3).map((skill) => (
              <GapRow
                key={skill.id}
                data-testid={`row-gap-${skill.id}`}
                name={skill.name}
                meta={`Current ${skill.level}/5 · Target ${skill.target}/5`}
                score={`${skill.target - skill.level} lvl`}
              />
            ))}
          </div>
        </section>
        <section className="sf-card sf-card-pad sf-action-card">
          <div>
            <div className="sf-action-kicker"><Lightbulb size={14} /> {summary.nextAction.kicker}</div>
            <h2 className="sf-action-title">{summary.nextAction.title}</h2>
            <p className="sf-action-copy">{summary.nextAction.copy}</p>
          </div>
          <Link href="/roadmap" className="sf-button sf-button-light" style={{ width: 'fit-content' }} data-testid="button-start-next-action">
            {summary.nextAction.ctaLabel} <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <section className="sf-card sf-card-pad" style={{ marginTop: 18 }}>
        <div className="sf-section-head">
          <div>
            <h2 className="sf-section-title">Readiness trend</h2>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>A steady climb, with clarity over time.</div>
          </div>
          <Pill tone="teal"><TrendingUp size={12} /> {summary.readinessTrendChart.trendCopy}</Pill>
        </div>
        <BarTrendChart
          values={summary.readinessTrendChart.values}
          labels={summary.readinessTrendChart.labels}
          heightMultiplier={1.4}
          ariaLabel="Readiness trend from July to October"
        />
      </section>
    </div>
  );
}
