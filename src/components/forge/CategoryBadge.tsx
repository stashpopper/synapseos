import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  category: 'security' | 'performance' | 'quality' | 'style' | 'architecture';
}

const categoryConfig = {
  security: { icon: '🛡️', label: 'Security', color: 'text-red-400' },
  performance: { icon: '⚡', label: 'Performance', color: 'text-amber-400' },
  quality: { icon: '🔍', label: 'Quality', color: 'text-blue-400' },
  style: { icon: '🎨', label: 'Style', color: 'text-purple-400' },
  architecture: { icon: '🏗️', label: 'Architecture', color: 'text-cyan-400' },
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = categoryConfig[category];

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', config.color)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
