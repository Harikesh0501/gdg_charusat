import { useState } from 'react';
import { PageHead } from '@/components/shared/PageHead';
import { RecommendationRow } from '@/components/recommendations/RecommendationRow';
import { getRecommendations } from '@/services/mock';
import type { RecommendationCategory } from '@/types/recommendation';

export function Recommendations() {
  const resources = getRecommendations();
  const categories = Object.keys(resources) as RecommendationCategory[];
  const [tab, setTab] = useState<RecommendationCategory>('Resources');

  return (
    <div className="sf-content">
      <PageHead
        eyebrow="Chosen for your gaps"
        title="Recommendations"
        copy="Less content, more relevance. Every suggestion earns its place by mapping to the role signal you’re building."
      />
      <section className="sf-card sf-card-pad">
        <div className="sf-tabs" role="tablist">
          {categories.map((name) => (
            <button
              type="button"
              className={`sf-tab ${tab === name ? 'active' : ''}`}
              key={name}
              id={`tab-${name.toLowerCase()}`}
              onClick={() => setTab(name)}
              data-testid={`tab-recommendations-${name.toLowerCase()}`}
              role="tab"
              aria-selected={tab === name}
              aria-controls="recommendations-panel"
            >
              {name} <span className="sf-mono" style={{ fontSize: 10, marginLeft: 4 }}>{resources[name].length}</span>
            </button>
          ))}
        </div>
        <div id="recommendations-panel" role="tabpanel" aria-labelledby={`tab-${tab.toLowerCase()}`}>
          {resources[tab].map((recommendation) => (
            <RecommendationRow key={recommendation.title} {...recommendation} />
          ))}
        </div>
      </section>
    </div>
  );
}
