/**
 * ForgePage — AI Code Review & Analysis
 * ======================================
 * Clean, modern interface for submitting code and viewing analysis results.
 */

import { useState } from 'react';
import { Code, Bug, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import AnalysisPanel from './AnalysisPanel';
import ResultsDashboard from './ResultsDashboard';
import ErrorBoundary from './ErrorBoundary';
import { type AnalysisResult } from '../../api/forge';

export default function ForgePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [_isAnalyzing, setIsAnalyzing] = useState(false);

  const handleResult = (analysisResult: AnalysisResult) => {
    console.log('[ForgePage] handleResult called with:', analysisResult.health_score, analysisResult.summary);
    setResult(analysisResult);
    setShowResults(true);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setResult(null);
    setShowResults(false);
  };

  // Analysis capabilities
  const capabilities = [
    {
      icon: <Bug className="w-5 h-5" />,
      title: 'Bug Detection',
      desc: 'Logic errors, edge cases, and subtle bugs that linters miss',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Security Scan',
      desc: 'OWASP Top 10 vulnerabilities, auth bypasses, and secret detection',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Performance',
      desc: 'Algorithmic complexity, N+1 queries, and optimization opportunities',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Code Quality',
      desc: 'Anti-patterns, cyclomatic complexity, and best practices',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {!showResults ? (
          <div className="space-y-12">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto pt-8 pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-primary/5 border border-primary/10 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary tracking-wide">
                  Multi-Agent Code Analysis
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Submit Your Code for{' '}
                <span className="gradient-text">AI-Powered Review</span>
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
                Paste your code or upload a file. Seven specialized AI agents will analyze it
                for bugs, security issues, performance problems, and code quality — all in real-time.
              </p>
            </div>

            {/* Analysis Capabilities */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className={`glass-card glass-card-hover p-5 group transition-all duration-300 hover:border-border-hover`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cap.bg} ${cap.color} border ${cap.border} group-hover:scale-110 transition-transform duration-300`}>
                    {cap.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{cap.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>

            {/* Analysis Panel */}
            <AnalysisPanel onResult={handleResult} />
          </div>
        ) : result ? (
          /* Results View */
          <div className="space-y-12">
            {/* Results Header */}
            <div className="text-center max-w-3xl mx-auto pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 tracking-wide">
                  Analysis Complete
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                Review Results
              </h1>
              <p className="text-slate-500 text-base leading-relaxed">
                {result.health_score >= 80
                  ? 'Great job! Your code looks solid with minimal issues.'
                  : result.health_score >= 60
                  ? 'Good foundation, but there are some areas that need attention.'
                  : 'Several issues detected that should be addressed before deployment.'}
              </p>
            </div>

            {/* Results Dashboard */}
            <ErrorBoundary>
              <ResultsDashboard result={result} />
            </ErrorBoundary>

            {/* Analyze Another */}
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-primary-dim text-background hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                <Code className="w-4 h-4" />
                Analyze Another File
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
