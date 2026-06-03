import AgentStatus from './AgentStatus';

interface AgentTimelineProps {
  agents: Record<string, { status: 'pending' | 'running' | 'completed' | 'error'; message?: string }>;
}

export default function AgentTimeline({ agents }: AgentTimelineProps) {
  // Group agents: planner runs first, then parallel, then synthesizer, then docs
  const stages = [
    { label: 'Planning', agents: ['planner'] },
    { label: 'Analysis', agents: ['reviewer', 'security', 'performance'] },
    { label: 'Synthesis', agents: ['synthesizer'] },
    { label: 'Documentation', agents: ['docs'] },
  ];

  return (
    <div className="space-y-4">
      {stages.map((stage, _stageIndex) => (
        <div key={stage.label}>
          {/* Stage label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {stage.label}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Agents in this stage */}
          <div className="flex flex-wrap gap-2">
            {stage.agents.map((agentId, i) => (
              <div key={agentId} className="flex items-center">
                <AgentStatus
                  agent={agentId}
                  status={agents[agentId]?.status || 'pending'}
                  message={agents[agentId]?.message}
                  index={i}
                />
                {stage.agents.length > 1 && i < stage.agents.length - 1 && (
                  <span className="mx-2 text-slate-700">+</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
