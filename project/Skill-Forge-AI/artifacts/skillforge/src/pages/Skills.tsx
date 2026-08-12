import { useState } from 'react';
import { Check, UploadCloud, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { PageHead } from '@/components/shared/PageHead';
import { Pill } from '@/components/shared/Pill';
import { SkillRow } from '@/components/skills/SkillRow';
import { useSkills } from '@/hooks/use-workspace-data';
import { getDashboardSummary, getSkillCategories } from '@/services/mock';

const ALL_SKILLS = 'All skills';

export function Skills() {
  const skills = useSkills();
  const categories = getSkillCategories();
  const summary = getDashboardSummary();
  const [filter, setFilter] = useState(ALL_SKILLS);
  const visible = filter === ALL_SKILLS ? skills : skills.filter((skill) => skill.category === filter);

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Your capability map"
        title="Skills inventory"
        copy="A grounded view of what you can do today — and the evidence behind it."
        action={
          <Link href="/resume" className="sf-button sf-button-primary" data-testid="button-update-skills">
            <UploadCloud size={15} /> Update from resume
          </Link>
        }
      />
      <div className="sf-filter-row">
        <select
          className="sf-select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter skills by capability"
          data-testid="select-skill-filter"
        >
          <option>{ALL_SKILLS}</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <Pill tone="teal"><Check size={12} /> {summary.masteredSkills} mastered</Pill>
        <Pill tone="orange"><Zap size={12} /> {summary.priorityGapsCount} priority gaps</Pill>
      </div>
      <section className="sf-card sf-card-pad">
        <div className="sf-section-head">
          <h2 className="sf-section-title">{filter === ALL_SKILLS ? 'All capabilities' : filter}</h2>
          <span className="sf-mini-label">{visible.length} shown</span>
        </div>
        {visible.map((skill) => <SkillRow key={skill.id} skill={skill} />)}
      </section>
    </div>
  );
}
