import { cn } from '../../lib/utils';

interface CategoryBadgeProps {
  category: string;
}

const categoryConfig: Record<string, { icon: string; label: string; color: string }> = {
  security: { icon: '🛡️', label: 'Security', color: 'text-red-400' },
  performance: { icon: '⚡', label: 'Performance', color: 'text-amber-400' },
  quality: { icon: '🔍', label: 'Quality', color: 'text-blue-400' },
  style: { icon: '🎨', label: 'Style', color: 'text-purple-400' },
  architecture: { icon: '🏗️', label: 'Architecture', color: 'text-cyan-400' },
  // Default fallback for unknown categories
  default: { icon: '📋', label: 'General', color: 'text-slate-400' },
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  // Normalize category: lowercase, trim, try exact match first
  const normalized = (category || '').toLowerCase().trim();
  const config = categoryConfig[normalized] || categoryConfig['default'];

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', config.color)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
