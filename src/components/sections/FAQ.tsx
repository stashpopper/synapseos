import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItemData[] = [
  {
    id: 'what-is',
    question: 'What is SynapseOS?',
    answer:
      'SynapseOS is an AI-powered code review and analysis platform. It uses seven specialized AI agents to automatically analyze your code for bugs, security vulnerabilities, performance issues, and code quality — all running locally on your machine. Think of it as having a senior engineering team reviewing your code 24/7.',
  },
  {
    id: 'how-works',
    question: 'How does the multi-agent analysis work?',
    answer:
      'Each of our seven agents specializes in a different aspect of code review: a Planner agent maps out the analysis strategy, a Reviewer agent checks for logic and quality issues, a Quality agent scores the code, a Security agent scans for vulnerabilities, a Performance agent identifies bottlenecks, a Synthesizer agent consolidates findings, and a Docs agent suggests documentation improvements. They all work in parallel for comprehensive coverage.',
  },
  {
    id: 'languages',
    question: 'Which programming languages are supported?',
    answer:
      'SynapseOS supports all major programming languages including Python, JavaScript/TypeScript, Go, Rust, Java, C++, and more. The AI agents are trained on best practices across multiple languages and can adapt their analysis based on the language and framework you\'re using. We\'re continuously adding support for new languages and frameworks.',
  },
  {
    id: 'security',
    question: 'Is my code safe? Does it leave my machine?',
    answer:
      'Absolutely not. SynapseOS runs entirely on your local hardware — your source code never leaves your machine. There are no telemetry calls, no analytics, and no external API calls. Your code is analyzed locally, making it ideal for proprietary codebases, regulated industries, and any scenario where code privacy is critical.',
  },
  {
    id: 'deep-scan',
    question: 'What\'s the difference between Standard and Deep Scan?',
    answer:
      'Standard Scan uses 3 agents (Reviewer, Quality, Security) for fast, essential analysis — perfect for quick checks during development. Deep Scan activates all 7 agents including Performance, Docs, and Synthesizer agents for comprehensive analysis. Use Deep Scan for critical code, production deployments, or when you need the most thorough review possible.',
  },
  {
    id: 'pricing',
    question: 'Is SynapseOS free to use?',
    answer:
      'SynapseOS Core is completely free for individual developers — includes 3 analysis agents and up to 500 file analyses per month. The Pro edition ($49/month) unlocks all 7 agents, unlimited analysis, Git integration, and team features. Enterprise plans are available for organizations needing custom configurations and dedicated support.',
  },
  {
    id: 'integration',
    question: 'Can I integrate SynapseOS with my Git workflow?',
    answer:
      'Yes! SynapseOS integrates seamlessly with your existing Git workflow. You can analyze files via CLI, review pull requests with inline comments, and get real-time feedback on code changes. The Pro and Enterprise plans include native Git integration with support for GitHub, GitLab, and Bitbucket. Our REST API also makes it easy to build custom integrations.',
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isItemOpen = (id: string) => openItems.includes(id);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-surface-elevated border border-border rounded-full">
            <span className="text-xs font-medium text-slate-400 tracking-wide">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Frequently Asked{' '}
            <span className="gradient-text">Questions.</span>
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            Everything you need to know about AI-powered code review with SynapseOS.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = isItemOpen(item.id);

            return (
              <div
                key={item.id}
                className={`glass-card glass-card-hover overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-primary/20' : ''
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="text-sm sm:text-base font-medium text-slate-200 pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ease-out ${
                      isOpen
                        ? 'bg-primary/10 text-primary -rotate-180'
                        : 'bg-surface-elevated text-slate-500 rotate-0'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Answer */}
                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
