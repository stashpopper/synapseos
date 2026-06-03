import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import CategoryBadge from './CategoryBadge';
import { cn } from '../../lib/utils';

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  file: string;
  line: number | null;
  description: string;
  recommendation: string;
  code_snippet: string | null;
  cwe_id: string | null;
}

interface ResultCardProps {
  finding: Finding;
  index: number;
}

export default function ResultCard({ finding, index }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFinding = { ...finding, severity: finding.severity as 'critical' | 'high' | 'medium' | 'low' };

  return (
    <div
      className={cn(
        'glass-card overflow-hidden transition-all duration-300',
        'hover:border-border-hover'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left focus:outline-none"
      >
        <SeverityBadge severity={sortedFinding.severity} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-200 truncate">
            {sortedFinding.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={sortedFinding.category as any} />
            {sortedFinding.line && (
              <span className="text-xs text-slate-600 font-mono">
                {sortedFinding.file}:{sortedFinding.line}
              </span>
            )}
            {sortedFinding.cwe_id && (
              <span className="text-xs text-slate-600 font-mono">
                {sortedFinding.cwe_id}
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="mt-3 space-y-3">
            {/* Description */}
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Description</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {sortedFinding.description}
              </p>
            </div>

            {/* Recommendation */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-primary font-medium mb-0.5">Recommendation</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {sortedFinding.recommendation}
                </p>
              </div>
            </div>

            {/* Code snippet */}
            {sortedFinding.code_snippet && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Code</p>
                <pre className="text-xs font-mono text-slate-400 bg-surface-elevated p-3 rounded-lg overflow-x-auto border border-border">
                  <code>{sortedFinding.code_snippet}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
