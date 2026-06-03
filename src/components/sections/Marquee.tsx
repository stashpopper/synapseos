interface Partner {
  name: string;
  tier: 'platinum' | 'gold' | 'silver';
}

const partners: Partner[] = [
  { name: 'GitHub', tier: 'platinum' },
  { name: 'GitLab', tier: 'platinum' },
  { name: 'Vercel', tier: 'gold' },
  { name: 'Stripe', tier: 'gold' },
  { name: 'Linear', tier: 'platinum' },
  { name: 'Datadog', tier: 'gold' },
  { name: 'Sentry', tier: 'silver' },
  { name: 'MongoDB', tier: 'silver' },
  { name: 'HashiCorp', tier: 'silver' },
  { name: 'Cloudflare', tier: 'gold' },
  { name: 'Twilio', tier: 'silver' },
  { name: 'Shopify', tier: 'gold' },
];

export default function Marquee() {
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden border-y border-border/50">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="mb-8 text-center">
        <p className="text-xs font-medium text-slate-600 tracking-widest uppercase">
          Trusted by Engineering Teams Worldwide
        </p>
      </div>

      {/* Marquee Track */}
      <div className="relative overflow-hidden">
        <div
          className="flex items-center gap-12 animate-marquee"
          style={{
            width: 'max-content',
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-3 px-8 py-4 rounded-xl border border-border/50 bg-surface/30 hover:bg-surface/60 hover:border-border-hover transition-all duration-300 flex-shrink-0"
            >
              {/* Logo placeholder */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  partner.tier === 'platinum'
                    ? 'bg-primary/10 text-primary'
                    : partner.tier === 'gold'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-slate-700/50 text-slate-500'
                }`}
              >
                {partner.name.charAt(0)}
              </div>
              <span
                className={`text-sm font-medium ${
                  partner.tier === 'platinum'
                    ? 'text-slate-300'
                    : partner.tier === 'gold'
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto px-6">
        {[
          { value: '10K+', label: 'Codebases Analyzed' },
          { value: '2.4M+', label: 'Issues Found' },
          { value: '96%', label: 'Bug Detection Rate' },
          { value: '<3s', label: 'Avg. Review Time' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
