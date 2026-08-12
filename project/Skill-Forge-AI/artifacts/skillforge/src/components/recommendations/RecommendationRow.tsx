import { Plus } from 'lucide-react';
import { IconTile } from '@/components/shared/IconTile';
import { Pill } from '@/components/shared/Pill';
import type { Recommendation } from '@/types/recommendation';

export function RecommendationRow({ icon, title, tag, reason }: Recommendation) {
  const slug = title.toLowerCase().replaceAll(' ', '-');
  return (
    <div className="sf-resource" data-testid={`resource-${slug}`}>
      <IconTile icon={icon} />
      <div style={{ flex: 1 }}>
        <h3>{title}</h3>
        <Pill tone="teal" style={{ marginBottom: 9 }}>{tag}</Pill>
        <p>{reason}</p>
      </div>
      <button type="button" className="sf-icon-button" aria-label={`Save ${title}`} data-testid={`button-save-${slug}`}>
        <Plus size={15} />
      </button>
    </div>
  );
}
