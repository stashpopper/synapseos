/**
 * SynapseOS — Code Review Pipeline Animation
 * =============================================
 * Animated visualization showing the sequential multi-agent code review process.
 * Non-interactive — demonstrates how code flows through the analysis pipeline.
 */

import { useState, useEffect } from 'react';
import {
  Code,
  Brain,
  Shield,
  Zap,
  Sparkles,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';

// ─── Sample code for the animation ─────────────────────────────

const sampleCode = `def authenticate_user(token):
    """Authenticate user from JWT token."""
    if not token or token.startswith("Bearer "):
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY)
        user = User.query.get(payload["sub"])
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None`;

// ─── Pipeline animation data ───────────────────────────────────

interface PipelineStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  status: 'pending' | 'active' | 'complete';
  findings?: string[];
}

const pipelineSteps: PipelineStep[] = [
  {
    id: 'planner',
    icon: <Brain className="w-5 h-5" />,
    label: 'Planner',
    sublabel: 'Analyzing structure...',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    status: 'pending',
    findings: ['3 functions detected', '1 authentication flow'],
  },
  {
    id: 'reviewer',
    icon: <Search className="w-5 h-5" />,
    label: 'Reviewer',
    sublabel: 'Checking logic...',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    status: 'pending',
    findings: ['Missing Bearer prefix check', 'Null token not handled'],
  },
  {
    id: 'quality',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Quality',
    sublabel: 'Scoring quality...',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/30',
    status: 'pending',
    findings: ['Good docstring', 'Missing error types'],
  },
  {
    id: 'security',
    icon: <Shield className="w-5 h-5" />,
    label: 'Security',
    sublabel: 'Scanning vulnerabilities...',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
    status: 'pending',
    findings: ['Secret in code', 'No token expiry check', 'SQL injection risk'],
  },
  {
    id: 'performance',
    icon: <Zap className="w-5 h-5" />,
    label: 'Performance',
    sublabel: 'Analyzing complexity...',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    status: 'pending',
    findings: ['O(n) query per call', 'No caching'],
  },
  {
    id: 'synthesizer',
    icon: <Layers className="w-5 h-5" />,
    label: 'Synthesizer',
    sublabel: 'Consolidating...',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
    status: 'pending',
    findings: ['5 issues found', 'Severity: Medium-High'],
  },
  {
    id: 'docs',
    icon: <FileText className="w-5 h-5" />,
    label: 'Docs',
    sublabel: 'Generating report...',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/30',
    status: 'pending',
    findings: ['Report ready', 'Score: 72/100'],
  },
];

export default function Playground() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
  const [isLooping] = useState(true);

  // Animation sequence
  useEffect(() => {
    if (!isLooping) return;

    let timer: ReturnType<typeof setTimeout>;

    const runSequence = () => {
      // Phase 1: Show code
      setShowCode(true);
      timer = setTimeout(() => {
        // Phase 2: Start pipeline animation
        animatePipeline(0);
      }, 800);
    };

    const animatePipeline = (index: number) => {
      if (index >= pipelineSteps.length) {
        // All done — show results
        setTimeout(() => {
          setShowResults(true);
          // Loop after a pause
          timer = setTimeout(() => {
            resetAnimation();
            timer = setTimeout(runSequence, 1000);
          }, 4000);
        }, 500);
        return;
      }

      // Activate current step
      setCurrentStep(index);
      setHighlightedLines(getHighlightedLines(index));

      timer = setTimeout(() => {
        // Complete current step
        setCompletedSteps((prev) => [...prev, pipelineSteps[index].id]);
        setCurrentStep(-1);

        // Move to next step
        timer = setTimeout(() => animatePipeline(index + 1), 300);
      }, 1200);
    };

    const resetAnimation = () => {
      setCurrentStep(-1);
      setCompletedSteps([]);
      setShowResults(false);
      setShowCode(false);
      setHighlightedLines([]);
    };

    runSequence();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLooping]);

  const getHighlightedLines = (stepIndex: number): number[] => {
    const lineMap: Record<number, number[]> = {
      0: [1], // Planner — header
      1: [2, 3], // Reviewer — logic
      2: [2], // Quality — docstring
      3: [3, 4, 5], // Security — vulnerabilities
      4: [10], // Performance — query
      5: [], // Synthesizer — all
      6: [], // Docs — all
    };
    return lineMap[stepIndex] || [];
  };

  const getStepStatus = (index: number): 'pending' | 'active' | 'complete' => {
    if (completedSteps.includes(pipelineSteps[index].id)) return 'complete';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStatusIcon = (index: number) => {
    const status = getStepStatus(index);
    if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'active') return <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />;
    return <div className="w-4 h-4 rounded-full border-2 border-slate-700" />;
  };

  return (
    <section id="playground" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-secondary/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-primary/5 border border-primary/10 rounded-full">
            <Code className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide">
              Live Pipeline Demo
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Watch AI Agents Review{' '}
            <span className="gradient-text">Code in Real-Time.</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Seven specialized agents analyze code sequentially — from planning to
            final report. See every step of the intelligent review process.
          </p>
        </div>

        {/* Main Animation Area */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Code Panel */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden sticky top-24">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-500">Input Code</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* Code content */}
              <div className="p-5 bg-background/50 min-h-[420px]">
                {!showCode ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-4">
                        <Code className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-600">Waiting for code submission...</p>
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-xs sm:text-sm leading-7">
                    {sampleCode.split('\n').map((line, i) => {
                      const isHighlighted = highlightedLines.includes(i);
                      return (
                        <div
                          key={i}
                          className={`flex transition-all duration-300 ${
                            isHighlighted
                              ? 'bg-primary/10 -mx-2 px-2 rounded border-l-2 border-primary'
                              : ''
                          }`}
                        >
                          <span className="text-slate-700 select-none w-7 text-right pr-3 flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className={isHighlighted ? 'text-slate-200' : 'text-slate-400'}>
                            {line}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="px-4 py-3 border-t border-border bg-surface/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    {showCode ? `${highlightedLines.length} lines highlighted` : 'Ready'}
                  </span>
                  <span className="text-xs text-slate-600">
                    authenticate_user.py
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pipeline Visualization */}
          <div className="lg:col-span-3">
            <div className="glass-card overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-500">
                    Analysis Pipeline
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep >= 0 ? 'bg-primary animate-pulse' : 'bg-slate-700'
                    }`}
                  />
                  <span className="text-xs text-slate-600">
                    {currentStep >= 0 ? `Agent ${currentStep + 1}/7` : completedSteps.length > 0 ? 'Complete' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Pipeline content */}
              <div className="p-5 sm:p-6">
                {/* Pipeline stages */}
                <div className="space-y-3">
                  {pipelineSteps.map((step, index) => {
                    const status = getStepStatus(index);

                    return (
                      <div
                        key={step.id}
                        className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                          status === 'active'
                            ? `${step.bgColor} ${step.borderColor} shadow-lg`
                            : status === 'complete'
                            ? 'bg-surface border-border/50'
                            : 'bg-surface/30 border-border/30 opacity-40'
                        }`}
                      >
                        {/* Step number & icon */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                              status === 'active'
                                ? `${step.bgColor} ${step.color} shadow-lg`
                                : status === 'complete'
                                ? 'bg-emerald-400/10 text-emerald-400'
                                : 'bg-surface-elevated text-slate-600'
                            }`}
                          >
                            {status === 'complete' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              step.icon
                            )}
                          </div>
                          {/* Connector line */}
                          {index < pipelineSteps.length - 1 && (
                            <div
                              className={`w-0.5 h-6 mt-1 transition-colors duration-500 ${
                                completedSteps.includes(step.id)
                                  ? 'bg-emerald-400/30'
                                  : 'bg-slate-800'
                              }`}
                            />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  status === 'active'
                                    ? step.color
                                    : status === 'complete'
                                    ? 'text-white'
                                    : 'text-slate-500'
                                }`}
                              >
                                {step.label}
                              </span>
                              {status === 'active' && (
                                <span className="text-xs text-slate-500 animate-pulse">
                                  ● analyzing
                                </span>
                              )}
                            </div>
                            {getStatusIcon(index)}
                          </div>

                          {/* Sublabel or findings */}
                          {status === 'active' ? (
                            <p className={`text-xs ${step.color} opacity-80`}>
                              {step.sublabel}
                            </p>
                          ) : status === 'complete' ? (
                            <div className="space-y-1">
                              {step.findings?.map((finding, fi) => (
                                <div
                                  key={fi}
                                  className="flex items-start gap-1.5 text-xs text-slate-400"
                                >
                                  {finding.includes('issue') || finding.includes('vulnerability') || finding.includes('risk') || finding.includes('Missing') ? (
                                    <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span>{finding}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">
                              {step.sublabel}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Results summary */}
                {showResults && (
                  <div className="mt-6 glass-card p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-lg font-bold text-background">72</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Analysis Complete
                        </h4>
                        <p className="text-xs text-slate-500">
                          5 issues found • Severity: Medium-High
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 rounded-lg bg-red-400/10 border border-red-400/20">
                        <p className="text-lg font-bold text-red-400">2</p>
                        <p className="text-[10px] text-red-400/70">Security</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-400/10 border border-amber-400/20">
                        <p className="text-lg font-bold text-amber-400">2</p>
                        <p className="text-[10px] text-amber-400/70">Quality</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
                        <p className="text-lg font-bold text-blue-400">1</p>
                        <p className="text-[10px] text-blue-400/70">Performance</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
