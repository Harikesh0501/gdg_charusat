import { RecommendationRow } from '@/components/recommendations/RecommendationRow';
import { getRecommendations } from '@/services/mock';

export function RecommendationPreview() {
  const resources = getRecommendations();
  const featured = resources.Resources[0];

  return (
    <section className="sf-landing-section" id="features">
      <div className="sf-landing-container">
        <div className="sf-landing-section-head">
          <p className="sf-landing-eyebrow">Chosen for your gaps</p>
          <h2 className="sf-landing-h2">Not just a gap. A next step.</h2>
          <p className="sf-landing-lede">
            Every recommendation explains why it was chosen — mapped to your specific gap, not a generic "AI recommended" label.
          </p>
        </div>
        <div className="sf-card sf-card-pad" style={{ maxWidth: 640, margin: '0 auto' }}>
          <RecommendationRow {...featured} />
        </div>
      </div>
    </section>
  );
}
