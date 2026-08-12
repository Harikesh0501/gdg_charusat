import { SkillRow } from '@/components/skills/SkillRow';
import { getSkills } from '@/services/mock';

export function SkillGapPreview() {
  const skills = getSkills().slice(0, 6);

  return (
    <section className="sf-landing-section tinted">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">Your skill gap</p>
          <h2 className="sf-landing-h2">What you know. What you're missing. What matters most.</h2>
          <p className="sf-landing-lede">
            SkillForge identifies what you already know, what you're missing for your target role,
            and which gaps to prioritize first — never a score you have to take on faith.
          </p>
        </div>
        <div className="sf-card sf-card-pad" style={{ maxWidth: 720, margin: '0 auto' }}>
          {skills.map((skill) => <SkillRow key={skill.id} skill={skill} />)}
        </div>
      </div>
    </section>
  );
}
