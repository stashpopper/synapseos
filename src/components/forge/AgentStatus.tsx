import { cn } from '../../lib/utils';

interface AgentStatusProps {
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  index: number;
}

const agentConfig: Record<string, { icon: string; label: string }> = {
  planner: { icon: '🔍', label: 'Planner' },
  reviewer: { icon: '🔍', label: 'Reviewer' },
  security: { icon: '🛡️', label: 'Security' },
  performance: { icon: '⚡', label: 'Performance' },
  synthesizer: { icon: '🧩', label: 'Synthesizer' },
  docs: { icon: '📝', label: 'Docs' },
};

const statusConfig = {
  pending: {
    bg: 'bg-surface-elevated',
    border: 'border-border',
    text: 'text-slate-600',
    iconBg: 'bg-surface-elevated',
  },
  running: {
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    text: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  completed: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  error: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconBg: 'bg-red-500/10',
  },
};

export default function AgentStatus({ agent, status, message, index }: AgentStatusProps) {
  const config = agentConfig[agent] || { icon: '⚙️', label: agent };
  const statusStyle = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300',
        statusStyle.bg,
        statusStyle.border
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
          statusStyle.iconBg
        )}
      >
        {status === 'running' ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>{config.icon}</span>
        )}
      </div>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', statusStyle.text)}>
            {config.label}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded',
              status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400'
                : status === 'running'
                ? 'bg-primary/10 text-primary'
                : status === 'error'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-surface text-slate-600'
            )}
          >
            {status}
          </span>
        </div>
        {message && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{message}</p>
        )}
      </div>

      {/* Arrow for non-last agents */}
      {status === 'completed' && (
        <svg className="w-4 h-4 text-emerald-500/50" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
