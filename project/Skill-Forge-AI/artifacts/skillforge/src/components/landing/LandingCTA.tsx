import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export function LandingCTA() {
  return (
    <section className="sf-landing-section dark">
      <div className="sf-landing-container sf-landing-cta">
        <h2>Start with what you know. Build the path forward.</h2>
        <p>Your resume and current skills are the starting point — SkillForge takes it from there.</p>
        <Link href="/onboarding" className="sf-button sf-button-primary" data-testid="link-cta-get-started">
          Build My Career Path <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
