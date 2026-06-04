/**
 * DocumentationPanel — Clean docs display
 * ========================================
 * Only shows sections that have actual content. No empty blocks.
 */

import { useState } from 'react';
import {
  FileText, Code, Settings, MessageSquare, BookOpen, Copy, Check,
  Sparkles
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface DocumentationPanelProps {
  docsResult: {
    agent: string;
    status: string;
    message: string;
    readme_suggestions?: string;
    api_docs?: string;
    configuration_docs?: string;
    comment_suggestions?: string[];
    test_suggestions?: string;
  } | null;
}

type DocsTab = 'readme' | 'api' | 'config' | 'comments' | 'tests';

interface DocSection {
  id: DocsTab;
  icon: typeof FileText;
  label: string;
  content: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function DocumentationPanel({ docsResult }: DocumentationPanelProps) {
  const [activeTab, setActiveTab] = useState<DocsTab>('readme');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!docsResult || docsResult.status !== 'completed') {
    return null;
  }

  // Build sections — only keep ones with actual content
  const allSections: DocSection[] = [
    {
      id: 'readme', icon: FileText, label: 'README',
      content: docsResult.readme_suggestions || '',
      color: 'text-primary', bgColor: 'bg-primary/5', borderColor: 'border-primary/20',
    },
    {
      id: 'api', icon: Code, label: 'API Docs',
      content: docsResult.api_docs || '',
      color: 'text-emerald-400', bgColor: 'bg-emerald-400/5', borderColor: 'border-emerald-400/20',
    },
    {
      id: 'config', icon: Settings, label: 'Configuration',
      content: docsResult.configuration_docs || '',
      color: 'text-cyan-400', bgColor: 'bg-cyan-400/5', borderColor: 'border-cyan-400/20',
    },
    {
      id: 'comments', icon: MessageSquare, label: 'Comments',
      content: docsResult.comment_suggestions?.join('\n\n') || '',
      color: 'text-violet-400', bgColor: 'bg-violet-400/5', borderColor: 'border-violet-400/20',
    },
    {
      id: 'tests', icon: BookOpen, label: 'Tests',
      content: docsResult.test_suggestions || '',
      color: 'text-amber-400', bgColor: 'bg-amber-400/5', borderColor: 'border-amber-400/20',
    },
  ];

  // Filter to only sections with content
  const sections = allSections.filter(s => s.content.trim().length > 0);

  // No content at all
  if (sections.length === 0) {
    return null;
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const activeSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Documentation Suggestions</h3>
          <span className="text-xs text-slate-600 ml-auto">{docsResult.message}</span>
        </div>

        {/* Tabs — only for sections with content */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {sections.map((section) => {
            const isActive = activeTab === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? `${section.bgColor} ${section.color} ${section.borderColor}`
                    : `text-slate-500 hover:text-slate-300 border-transparent hover:border-border`
                }`}
              >
                <section.icon className="w-3.5 h-3.5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        <div className="relative">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white">{activeSection.label}</span>
            <button
              onClick={() => handleCopy(activeSection.content, activeSection.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                copiedSection === activeSection.id
                  ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
                  : 'bg-surface-elevated text-slate-400 border-border hover:text-white hover:border-border-hover'
              }`}
              title="Copy to clipboard"
            >
              {copiedSection === activeSection.id ? (
                <><Check className="w-3.5 h-3.5" /> Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy</>
              )}
            </button>
          </div>

          {/* Rendered markdown — no wrapper block */}
          <MarkdownRenderer content={activeSection.content} />
        </div>
      </div>
    </div>
  );
}
