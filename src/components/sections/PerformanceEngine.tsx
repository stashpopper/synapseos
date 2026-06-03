import { useState, useEffect, useRef } from 'react';
import { Gauge, Zap, Cpu, Target } from 'lucide-react';

interface MetricCard {
  label: string;
  standardValue: string;
  turboValue: string;
  standardLabel: string;
  turboLabel: string;
  icon: React.ReactNode;
}

const metricCards: MetricCard[] = [
  {
    label: 'Files Analyzed',
    standardValue: '50',
    turboValue: '200',
    standardLabel: 'files/min',
    turboLabel: 'files/min',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    label: 'Agents Running',
    standardValue: '3',
    turboValue: '7',
    standardLabel: 'agents',
    turboLabel: 'agents',
    icon: <Gauge className="w-5 h-5" />,
  },
  {
    label: 'Vulnerabilities Found',
    standardValue: '12',
    turboValue: '34',
    standardLabel: 'finds/file',
    turboLabel: 'finds/file',
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    label: 'Review Accuracy',
    standardValue: '85',
    turboValue: '96',
    standardLabel: '%',
    turboLabel: '%',
    icon: <Target className="w-5 h-5" />,
  },
];

function AnimatedCounter({
  target,
  duration = 1500,
}: {
  target: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState('0');
  const numericTarget = parseInt(target, 10);
  const prevTarget = useRef<string>(target);

  useEffect(() => {
    // Only animate when target actually changes
    if (prevTarget.current === target && display !== '0') return;
    prevTarget.current = target;

    setDisplay('0');
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * numericTarget);
      setDisplay(String(start));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, numericTarget, duration]);

  return <span>{display}</span>;
}

export default function PerformanceEngine() {
  const [turboMode, setTurboMode] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (turboMode) {
      let frame: number;
      const animate = () => {
        setPulseIntensity(1 + Math.sin(Date.now() / 300) * 0.5);
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      animationRef.current = frame;
    } else {
      setPulseIntensity(1);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [turboMode]);

  return (
    <section id="performance" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-[150px] transition-opacity duration-1000"
          style={{ opacity: pulseIntensity * 0.3 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-secondary/5 border border-secondary/10 rounded-full">
            <Zap className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-medium text-secondary tracking-wide">
              Analysis Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Deep Analysis,{' '}
            <span className="gradient-text">Lightning Fast.</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Toggle between Standard and Deep Scan modes to find your perfect balance
            of speed and thoroughness. More agents, more insights — in real-time.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-16">
          <div className="relative inline-flex items-center gap-4 p-1.5 bg-surface-elevated border border-border rounded-2xl">
            <button
              onClick={() => setTurboMode(false)}
              className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 ease-out ${
                !turboMode
                  ? 'bg-surface border border-border text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Standard Scan
            </button>
            <button
              onClick={() => setTurboMode(true)}
              className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 ease-out ${
                turboMode
                  ? 'bg-gradient-to-r from-primary to-primary-dim text-background shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Deep Scan (7 Agents)
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metricCards.map((card, index) => (
            <div
              key={card.label}
              className={`relative glass-card glass-card-hover p-6 sm:p-8 group transition-all duration-500 ${
                turboMode ? 'border-primary/20' : ''
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Pulse ring on turbo mode */}
              {turboMode && (
                <div
                  className="absolute inset-0 rounded-2xl border border-primary/10"
                  style={{
                    animation: `glow-pulse ${1 / pulseIntensity}s ease-in-out infinite alternate`,
                  }}
                />
              )}

              <div className="relative z-10">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-lg text-xs font-medium ${
                    turboMode
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-elevated text-slate-400 border border-border'
                  }`}
                >
                  {card.icon}
                  {card.label}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
                    <AnimatedCounter
                      target={turboMode ? card.turboValue : card.standardValue}
                    />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      turboMode ? 'text-primary' : 'text-slate-500'
                    }`}
                  >
                    {turboMode ? card.turboLabel : card.standardLabel}
                  </span>
                  <span className="text-xs text-slate-600">
                    {turboMode
                      ? `+${card.turboValue} vs ${card.standardValue} standard`
                      : `↑ ${card.turboValue} with Deep Scan`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      turboMode
                        ? 'bg-gradient-to-r from-primary to-secondary'
                        : 'bg-slate-600'
                    }`}
                    style={{
                      width: turboMode
                        ? `${Math.min((parseInt(card.turboValue) / (parseInt(card.turboValue) + 10)) * 100, 95)}%`
                        : `${Math.min((parseInt(card.standardValue) / (parseInt(card.turboValue) + 10)) * 100, 70)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 text-sm">
            * Benchmarks measured on 10K+ LOC codebases. Actual results may vary based on code complexity and project size.
          </p>
        </div>
      </div>
    </section>
  );
}
