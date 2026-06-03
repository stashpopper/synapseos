import { Check, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

interface PricingTier {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  icon: React.ReactNode;
}

const tiers: PricingTier[] = [
  {
    name: 'Core',
    description: 'Essential code review for individual developers.',
    price: '$0',
    period: 'forever',
    features: [
      '3 analysis agents',
      'Up to 500 files/month',
      'Basic security scanning',
      'Quality score & suggestions',
      'Community support',
      'CLI interface',
    ],
    highlighted: false,
    ctaText: 'Get Started Free',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    name: 'Pro',
    description: 'Full-spectrum review for professional teams.',
    price: '$49',
    period: '/month',
    features: [
      'All 7 analysis agents',
      'Unlimited file analysis',
      'Deep security & compliance scan',
      'Git integration & PR reviews',
      'Priority support (4hr SLA)',
      'Team collaboration & sharing',
      'Custom rule configuration',
    ],
    highlighted: true,
    ctaText: 'Start Free Trial',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large-scale codebases.',
    price: 'Custom',
    period: 'contact us',
    features: [
      'Dedicated analysis infrastructure',
      'Custom agent training on your codebase',
      'On-premise deployment',
      '24/7 dedicated support',
      'SLA guarantees (99.99%)',
      'Security audits & compliance',
      'Custom integrations & SSO',
      'Training & onboarding',
    ],
    highlighted: false,
    ctaText: 'Contact Sales',
    icon: <Sparkles className="w-4 h-4" />,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-surface-elevated border border-border rounded-full">
            <span className="text-xs font-medium text-slate-400 tracking-wide">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Simple,{' '}
            <span className="gradient-text">Transparent</span>{' '}
            Pricing.
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Start free and scale as your needs grow. No hidden fees, no usage-based
            surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, _index) => (
            <div
              key={tier.name}
              className={`relative glass-card glass-card-hover p-8 flex flex-col transition-all duration-500 ${
                tier.highlighted
                  ? 'border-primary/30 shadow-xl shadow-primary/5 scale-[1.02]'
                  : ''
              }`}
            >
              {/* Highlighted badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-semibold text-background bg-gradient-to-r from-primary to-primary-dim rounded-full shadow-lg shadow-primary/20">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                  tier.highlighted
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-elevated text-slate-500 border border-border'
                }`}
              >
                {tier.icon}
              </div>

              {/* Name & Description */}
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-sm text-slate-600 ml-1">{tier.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        tier.highlighted ? 'text-primary' : 'text-slate-600'
                      }`}
                    />
                    <span className="text-sm text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={tier.highlighted ? 'primary' : 'outline'}
                fullWidth
                glow={tier.highlighted}
              >
                {tier.ctaText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
