import { Lightbulb, CheckCircle } from 'lucide-react';

interface RecommendationsProps {
  recommendations: string[];
  scoreBreakdown?: {
    security: number;
    quality: number;
    performance: number;
  };
}

export default function Recommendations({ recommendations, scoreBreakdown }: RecommendationsProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Recommendations</h3>
      </div>

      {scoreBreakdown && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-surface-elevated border border-border">
            <div className="text-lg font-bold text-white">{scoreBreakdown.security}</div>
            <div className="text-xs text-slate-500">Security</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-elevated border border-border">
            <div className="text-lg font-bold text-white">{scoreBreakdown.quality}</div>
            <div className="text-xs text-slate-500">Quality</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-elevated border border-border">
            <div className="text-lg font-bold text-white">{scoreBreakdown.performance}</div>
            <div className="text-xs text-slate-500">Performance</div>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-400 leading-relaxed">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
