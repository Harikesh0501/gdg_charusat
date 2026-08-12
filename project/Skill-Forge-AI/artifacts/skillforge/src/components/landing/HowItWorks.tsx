import { Check, TrendingUp } from 'lucide-react';
import { GapRow } from '@/components/shared/GapRow';
import { Pill } from '@/components/shared/Pill';
import { getCareerGoals, getDashboardSummary, getRoadmap, getSkills } from '@/services/mock';

export function HowItWorks() {
  const skills = getSkills();
  const roadmap = getRoadmap();
  const goals = getCareerGoals();
  const summary = getDashboardSummary();
  const topSkills = skills.slice(0, 4);
  const priorityGaps = skills.filter((skill) => skill.state === 'Priority gap').slice(0, 2);
  const targetGoal = goals[0];
  const roadmapPreview = roadmap.slice(0, 3);

  return (
    <section className="sf-landing-section" id="how-it-works">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">How SkillForge works</p>
          <h2 className="sf-landing-h2">From your experience to a plan you can follow.</h2>
        </div>
        <div className="sf-step-list">
          <div className="sf-step">
            <div className="sf-step-index">01</div>
            <div className="sf-step-copy">
              <h3>Build your profile</h3>
              <p>Bring your resume and skills in — SkillForge builds a structured picture of what you already know.</p>
            </div>
            <div className="sf-step-fragment">
              <div className="sf-card sf-card-pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topSkills.map((skill) => <Pill key={skill.id} tone="teal">{skill.name}</Pill>)}
              </div>
            </div>
          </div>
          <div className="sf-step">
            <div className="sf-step-index">02</div>
            <div className="sf-step-copy">
              <h3>Choose your destination</h3>
              <p>Pick the role you're working toward. It tunes every comparison and recommendation that follows.</p>
            </div>
            <div className="sf-step-fragment">
              <div className="sf-card sf-card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{targetGoal.title}</strong>
                <Pill tone="teal"><Check size={12} /> Current target</Pill>
              </div>
            </div>
          </div>
          <div className="sf-step">
            <div className="sf-step-index">03</div>
            <div className="sf-step-copy">
              <h3>Understand your gap</h3>
              <p>See exactly what separates your current evidence from what the role requires.</p>
            </div>
            <div className="sf-step-fragment">
              <div className="sf-card sf-card-pad">
                {priorityGaps.map((skill) => (
                  <GapRow
                    key={skill.id}
                    name={skill.name}
                    meta={`Current ${skill.level}/5 · Target ${skill.target}/5`}
                    score={`${skill.target - skill.level} lvl`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="sf-step">
            <div className="sf-step-index">04</div>
            <div className="sf-step-copy">
              <h3>Follow your roadmap</h3>
              <p>An ordered, phased plan tied to your actual gaps — not a generic top-ten list.</p>
            </div>
            <div className="sf-step-fragment">
              <div className="sf-card sf-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {roadmapPreview.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12 }}>
                    <span className="sf-check-mark" style={item.done ? { background: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' } : undefined}>
                      {item.done && <Check size={11} />}
                    </span>
                    <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="sf-step">
            <div className="sf-step-index">05</div>
            <div className="sf-step-copy">
              <h3>Track your progress</h3>
              <p>Your readiness score updates as you complete real work — not a vanity number.</p>
            </div>
            <div className="sf-step-fragment">
              <div className="sf-card sf-card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="sf-mini-label">Readiness</div>
                  <div className="sf-stat-value" style={{ fontSize: 26, marginTop: 4 }}>{summary.readiness}%</div>
                </div>
                <Pill tone="teal"><TrendingUp size={12} /> {summary.readinessTrendChart.trendCopy}</Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
