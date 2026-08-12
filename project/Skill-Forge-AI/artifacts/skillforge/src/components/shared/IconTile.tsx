import type { LucideIcon } from 'lucide-react';

interface IconTileProps {
  icon: LucideIcon;
  size?: number;
}

export function IconTile({ icon: Icon, size = 17 }: IconTileProps) {
  return (
    <div className="sf-icon-tile">
      <Icon size={size} />
    </div>
  );
}
