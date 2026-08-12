import { Check, ListChecks } from 'lucide-react';
import { IconTile } from '@/components/shared/IconTile';
import type { RoadmapItem } from '@/types/roadmap';

interface RoadmapPhaseCardProps {
  index: string;
  title: string;
  period: string;
  items: RoadmapItem[];
  onToggle: (id: number) => void;
}

export function RoadmapPhaseCard({ index, title, period, items, onToggle }: RoadmapPhaseCardProps) {
  return (
    <section className="sf-card sf-phase">
      <div className="sf-phase-head">
        <div>
          <div className="sf-phase-index">PHASE {index}</div>
          <h3>{title}</h3>
          <p>{period}</p>
        </div>
        <IconTile icon={ListChecks} />
      </div>
      <div className="sf-checklist">
        {items.map((item) => (
          <button
            type="button"
            className={`sf-check ${item.done ? 'done' : ''}`}
            key={item.id}
            onClick={() => onToggle(item.id)}
            data-testid={`button-roadmap-item-${item.id}`}
            aria-pressed={item.done}
          >
            <span className="sf-check-mark">{item.done && <Check size={13} />}</span>
            <span>
              <span className="sf-check-title" style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.title}
              </span>
              <span className="sf-check-meta">{item.time} · {item.detail}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
