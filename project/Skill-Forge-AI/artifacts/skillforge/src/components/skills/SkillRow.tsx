import { ProgressBar } from '@/components/shared/ProgressBar';
import type { Skill } from '@/types/skill';

export function SkillRow({ skill }: { skill: Skill }) {
  return (
    <div className="sf-skill-row" data-testid={`row-skill-${skill.id}`}>
      <div>
        <div className="sf-skill-name">{skill.name}</div>
        <div className="sf-skill-category">{skill.category} · {skill.state}</div>
      </div>
      <div>
        <ProgressBar value={(skill.level / skill.target) * 100} />
      </div>
      <div className="sf-level">{skill.level}/{skill.target}</div>
    </div>
  );
}
