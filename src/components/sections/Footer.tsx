import { ChevronRight, Code, Bird, Link2 } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Documentation', 'CLI Docs'],
  Company: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Resources: ['Community', 'Tutorials', 'Examples', 'Status', 'Support'],
  Legal: ['Privacy', 'Terms', 'Security', 'Licenses'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-background"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Synapse<span className="text-primary">OS</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              AI-powered code review that keeps your source code private.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: <Code className="w-4 h-4" />, label: 'GitHub' },
                { icon: <Bird className="w-4 h-4" />, label: 'Twitter' },
                { icon: <Link2 className="w-4 h-4" />, label: 'LinkedIn' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-white bg-surface-elevated border border-border hover:border-border-hover hover:bg-surface transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-600 hover:text-slate-300 transition-colors duration-300 inline-flex items-center gap-1 group"
                    >
                      {link}
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} SynapseOS. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built with ❤️ for developers who ship clean code.
          </p>
        </div>
      </div>
    </footer>
  );
}
