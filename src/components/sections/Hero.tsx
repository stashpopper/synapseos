import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Shield, Zap, Cpu } from 'lucide-react';
import Button from '../ui/Button';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'success' | 'error';
}

const terminalLines: TerminalLine[] = [
  { text: '$ synapseos review src/auth/middleware.ts', type: 'input' },
  { text: '🔍 Analyzing file: auth/middleware.ts (142 lines)', type: 'output' },
  { text: '🧠 Running multi-agent analysis pipeline...', type: 'output' },
  { text: '⚡ Security scan: OWASP Top 10 + custom rules', type: 'output' },
  { text: '🛡️ 2 vulnerabilities found, 3 suggestions', type: 'success' },
  { text: '', type: 'output' },
  { text: '✅ Analysis complete — Quality Score: 78/100', type: 'success' },
  { text: '', type: 'output' },
  { text: '> "Fix the token validation bypass in line 47"', type: 'input' },
  { text: 'The token validation can be bypassed by sending...', type: 'output' },
];

export default function Hero({ onStartBuilding }: { onStartBuilding?: () => void } = {}) {
  const [terminalLinesVisible, setTerminalLinesVisible] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isHoveringTerminal, setIsHoveringTerminal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let lineIndex = 0;
    intervalRef.current = setInterval(() => {
      if (lineIndex < terminalLines.length) {
        lineIndex++;
        setTerminalLinesVisible(lineIndex);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 400);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const visibleLines = terminalLines.slice(0, terminalLinesVisible);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,245,212,0.03)_0%,transparent_60%)]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Typography */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-primary/5 border border-primary/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide">
                Multi-Agent Code Analysis — Now with Security Deep Scan
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6">
              Ship Cleaner Code,
              <br />
              <span className="gradient-text">Not Technical Debt.</span>
              <br />
              <span className="text-slate-400 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light">
                AI-Powered Code Review & Analysis.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              SynapseOS is the AI code reviewer that catches bugs, security
              vulnerabilities, and performance issues before they reach production.
              Multi-agent intelligence analyzing your code — instantly, thoroughly,
              and entirely on your machine.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
              <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" glow onClick={onStartBuilding}>
                Start Reviewing
              </Button>
              <Button variant="secondary" size="lg" icon={<Play className="w-4 h-4" />}>
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-4 h-4" />
                <span className="text-xs">7 Analysis Agents</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Zap className="w-4 h-4" />
                <span className="text-xs">Real-Time Results</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Cpu className="w-4 h-4" />
                <span className="text-xs">100% Private</span>
              </div>
            </div>
          </div>

          {/* Right: Terminal Mockup */}
          <div
            className="relative"
            onMouseEnter={() => setIsHoveringTerminal(true)}
            onMouseLeave={() => setIsHoveringTerminal(false)}
          >
            {/* Glow behind terminal */}
            <div
              className={`absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-2xl transition-opacity duration-1000 ${
                isHoveringTerminal ? 'opacity-100' : 'opacity-50'
              }`}
            />

            {/* Terminal Container */}
            <div className="relative glass-card p-1 glow-primary">
              {/* Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border rounded-t-xl">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <span className="ml-3 text-xs text-slate-600 font-mono">synapseos — terminal</span>
              </div>

              {/* Terminal Body */}
              <div className="bg-background/80 backdrop-blur-sm p-5 sm:p-6 font-mono text-sm leading-relaxed min-h-[320px] sm:min-h-[380px] overflow-hidden rounded-b-xl">
                {visibleLines.map((line, i) => (
                  <div
                    key={i}
                    className={`mb-1 ${
                      line.type === 'input'
                        ? 'text-primary'
                        : line.type === 'success'
                        ? 'text-emerald-400'
                        : line.type === 'error'
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {line.text || '\u00A0'}
                  </div>
                ))}
                <div className="text-primary">
                  {'>'}{' '}
                  <span className="text-slate-500">
                    "Fix the token validation bypass in line 47"
                  </span>
                  <span
                    className={`inline-block w-2 h-4 bg-primary ml-0.5 align-middle ${
                      cursorVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 glass-card px-3 py-1.5 animate-float">
              <span className="text-xs font-semibold text-primary">78/100</span>
            </div>
            <div
              className="absolute -bottom-3 -left-3 glass-card px-3 py-1.5 animate-float"
              style={{ animationDelay: '3s' }}
            >
              <span className="text-xs font-semibold text-secondary">7 Agents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
