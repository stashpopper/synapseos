/**
 * ResultsDashboard — Displays analysis results
 * ==============================================
 * Shows health score, findings, recommendations, and agent status.
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Zap, Shield, Code, FileText, Sparkles } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SeverityBadge from './SeverityBadge';
import ResultCard from './ResultCard';
import Recommendations from './Recommendations';
import AgentTimeline from './AgentTimeline';
import { type AnalysisResult, type Finding } from '../../api/forge';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'findings' | 'recommendations' | 'timeline'>('findings');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredFindings = severityFilter === 'all'
    ? result.findings
    : result.findings.filter((f) => f.severity === severityFilter);

  const severityCounts = {
    critical: result.findings.filter((f) => f.severity === 'critical').length,
    high: result.findings.filter((f) => f.severity === 'high').length,
    medium: result.findings.filter((f) => f.severity === 'medium').length,
    low: result.findings.filter((f) => f.severity === 'low').length,
  };

  const agentStatuses: Record<string, { status: 'pending' | 'running' | 'completed' | 'error'; message?: string }> = {
    planner: {
      status: result.agents.planner?.status === 'error' ? 'error' : 'completed',
      message: result.agents.planner?.message,
    },
    reviewer: {
      status: result.agents.reviewer?.status === 'error' ? 'error' : (result.agents.reviewer?.findings?.length ? 'completed' : 'pending'),
      message: result.agents.reviewer?.message,
    },
    security: {
      status: result.agents.security?.status === 'error' ? 'error' : (result.agents.security?.findings?.length ? 'completed' : 'pending'),
      message: result.agents.security?.message,
    },
    performance: {
      status: result.agents.performance?.status === 'error' ? 'error' : (result.agents.performance?.findings?.length ? 'completed' : 'pending'),
      message: result.agents.performance?.message,
    },
    synthesizer: {
      status: result.agents.synthesizer?.status === 'error' ? 'error' : 'completed',
      message: result.agents.synthesizer?.message,
    },
    docs: {
      status: result.agents.docs?.status === 'error' ? 'error' : 'completed',
      message: result.agents.docs?.message,
    },
  };

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={result.health_score} size="lg" />

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">
              Code Health: <span className={getScoreColor(result.health_score)}>{getScoreLabel(result.health_score)}</span>
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">{result.summary}</p>

            {/* Analysis ID */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-600 font-mono">ID: {result.analysis_id}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <div className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-red-400">{severityCounts.critical}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <AlertTriangle className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-400">{severityCounts.high}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">High</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-400">{severityCounts.medium}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Medium</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-emerald-400">{severityCounts.low}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-elevated border border-border rounded-xl p-1">
        {[
          { id: 'findings' as const, icon: Code, label: `Findings (${result.findings.length})` },
          { id: 'recommendations' as const, icon: FileText, label: 'Recommendations' },
          { id: 'timeline' as const, icon: Shield, label: 'Agents' },
          { id: 'quality' as const, icon: Zap, label: 'Quality Breakdown' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-surface text-primary border border-border shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Filter:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  severityFilter === sev
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-surface-elevated text-slate-500 border border-border hover:text-slate-300'
                }`}
              >
                {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>

          {/* Findings list */}
          {filteredFindings.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/30" />
              <p className="text-sm">No findings for this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFindings.map((finding, i) => (
                <ResultCard key={i} finding={finding} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <Recommendations
          recommendations={result.recommendations}
          scoreBreakdown={result.score_breakdown}
        />
      )}

      {activeTab === 'timeline' && (
        <AgentTimeline agents={agentStatuses} />
      )}

      {activeTab === 'quality' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Quality & Category Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Security Score */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-white">Security</span>
              </div>
              <div className="text-3xl font-bold text-red-400">
                {result.score_breakdown.security}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.findings.filter(f => f.category === 'security').length} issue(s)
              </div>
              <div className="mt-3 w-full bg-surface-elevated rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.score_breakdown.security}%` }}
                />
              </div>
            </div>

            {/* Quality Score */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-white">Quality</span>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {result.score_breakdown.quality}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.findings.filter(f => f.category === 'quality').length} issue(s)
              </div>
              <div className="mt-3 w-full bg-surface-elevated rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.score_breakdown.quality}%` }}
                />
              </div>
            </div>

            {/* Performance Score */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-white">Performance</span>
              </div>
              <div className="text-3xl font-bold text-amber-400">
                {result.score_breakdown.performance}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {result.findings.filter(f => f.category === 'performance').length} issue(s)
              </div>
              <div className="mt-3 w-full bg-surface-elevated rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.score_breakdown.performance}%` }}
                />
              </div>
            </div>
          </div>

          {/* Findings by Category */}
          <div className="glass-card p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Findings by Category</h4>
            <div className="space-y-2">
              {(['security', 'quality', 'performance'] as const).map(cat => {
                const catFindings = result.findings.filter(f => f.category === cat);
                if (catFindings.length === 0) return null;
                const colors = {
                  security: 'border-red-500/30 bg-red-500/5',
                  quality: 'border-green-500/30 bg-green-500/5',
                  performance: 'border-amber-500/30 bg-amber-500/5',
                };
                return (
                  <div key={cat} className={`p-3 rounded-xl border ${colors[cat]}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white capitalize">{cat}</span>
                      <span className="text-xs text-slate-500">{catFindings.length} finding(s)</span>\n                    </div>
                    <div className="space-y-1">
                      {catFindings.map((f, i) => (
                        <div key={i} className="text-xs text-slate-400">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            f.severity === 'critical' ? 'bg-red-500' :
                            f.severity === 'high' ? 'bg-orange-500' :
                            f.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          {f.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
