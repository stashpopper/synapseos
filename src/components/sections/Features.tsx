import { Shield, Zap, Cpu, Bug, Eye, GitBranch } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: 'primary' | 'secondary' | 'mixed';
}

const features: Feature[] = [
  {
    icon: <Bug className="w-5 h-5" />,
    title: 'Multi-Agent Bug Detection',
    description:
      'Seven specialized AI agents analyze your code simultaneously — catching logic errors, edge cases, and subtle bugs that traditional linters miss. From race conditions to memory leaks, nothing slips through.',
    gradient: 'primary',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Security Deep Scan',
    description:
      'OWASP Top 10 vulnerability scanning with custom rule engines. Detect SQL injection, XSS, auth bypasses, and hardcoded secrets before they become production incidents.',
    gradient: 'secondary',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Code Quality Intelligence',
    description:
      'Anti-pattern detection, cyclomatic complexity analysis, docstring quality scoring, and best practices enforcement. Get a comprehensive quality score for every file you submit.',
    gradient: 'primary',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Performance Optimization',
    description:
      'Algorithmic complexity analysis, N+1 query detection, inefficient loop detection, and memory usage profiling. Get actionable suggestions to make your code faster and lighter.',
    gradient: 'secondary',
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: 'Git Integration',
    description:
      'Seamlessly integrate with your Git workflow. Analyze diffs, review pull requests, and get inline comments on changed lines — all powered by AI agent intelligence.',
    gradient: 'primary',
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: '100% Private & Local',
    description:
      'Your code never leaves your machine. All analysis runs locally with no telemetry, no cloud APIs, and no data leakage. Your source code stays yours — period.',
    gradient: 'secondary',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-surface-elevated border border-border rounded-full">
            <span className="text-xs font-medium text-slate-400 tracking-wide">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Everything Your Team Needs to
            <br />
            <span className="gradient-text">Ship Better Code.</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Seven specialized AI agents working in concert to review your code for
            quality, security, performance, and maintainability — all in real-time.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card glass-card-hover p-6 sm:p-8 group transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 ${
                  feature.gradient === 'primary'
                    ? 'bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:shadow-lg group-hover:shadow-primary/10'
                    : 'bg-secondary/10 text-secondary group-hover:bg-secondary/15 group-hover:shadow-lg group-hover:shadow-secondary/10'
                }`}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
