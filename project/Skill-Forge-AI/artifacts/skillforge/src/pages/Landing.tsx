import { FeatureSection } from '@/components/landing/FeatureSection';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNav } from '@/components/landing/LandingNav';
import { PersonalizationSection } from '@/components/landing/PersonalizationSection';
import { ReadinessPreview } from '@/components/landing/ReadinessPreview';
import { RecommendationPreview } from '@/components/landing/RecommendationPreview';
import { RoadmapPreview } from '@/components/landing/RoadmapPreview';
import { SkillGapPreview } from '@/components/landing/SkillGapPreview';

export function Landing() {
  return (
    <div className="sf-landing">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <SkillGapPreview />
        <PersonalizationSection />
        <RoadmapPreview />
        <RecommendationPreview />
        <ReadinessPreview />
        <FeatureSection />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
