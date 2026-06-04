/**
 * DocumentationPanel — Beautiful docs display
 * ============================================
 * Renders documentation suggestions with rich, colorful markdown styling.
 */

import { useState } from 'react';
import {
  FileText, Code, Settings, MessageSquare, BookOpen, Copy, Check,
  Sparkles, ChevronDown, ChevronUp
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!docsResult || docsResult.status !== 'completed') {
    return (
      <div className="glass-card p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-slate-500 text-sm">
          {docsResult?.status === 'error'
            ? `Docs generation failed: ${docsResult.message}`
            : 'Documentation agent has not completed yet.'}
        </p>
      </div>
    );
  }

  // Build sections with content
  const sections: DocSection[] = [
    {
      id: 'readme',
      icon: FileText,
      label: 'README',
      content: docsResult.readme_suggestions || '',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20',
    },
    {
      id: 'api',
      icon: Code,
      label: 'API Docs',
      content: docsResult.api_docs || '',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/5',
      borderColor: 'border-emerald-400/20',
    },
    {
      id: 'config',
      icon: Settings,
      label: 'Configuration',
      content: docsResult.configuration_docs || '',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/5',
      borderColor: 'border-cyan-400/20',
    },
    {
      id: 'comments',
      icon: MessageSquare,
      label: 'Comments',
      content: docsResult.comment_suggestions?.join('\n\n') || '',
      color: 'text-violet-400',
      bgColor: 'bg-violet-400/5',
      borderColor: 'border-violet-400/20',
    },
    {
      id: 'tests',
      icon: BookOpen,
      label: 'Tests',
      content: docsResult.test_suggestions || '',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/5',
      borderColor: 'border-amber-400/20',
    },
  ];

  const hasAnyContent = sections.some(s => s.content && s.content.trim().length > 0);

  if (!hasAnyContent) {
    return (
      <div className="glass-card p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-slate-500 text-sm mb-3">{docsResult.message}</p>
        <p className="text-xs text-slate-600">No specific documentation suggestions were generated for this code.</p>
      </div>
    );
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSection = sections.find(s => s.id === activeTab)!;
  const hasActiveContent = activeSection.content && activeSection.content.trim().length > 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Documentation Suggestions</h3>
            <p className="text-xs text-slate-500">{docsResult.message}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono">{sections.filter(s => s.content.trim()).length}/{sections.length} sections</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {sections.map((section) => {
            const hasContent = section.content.trim().length > 0;
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
                {hasContent && (
                  <span className={`w-1.5 h-1.5 rounded-full ${section.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        {hasActiveContent ? (
          <div className="relative">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <activeSection.icon className={`w-4 h-4 ${activeSection.color}`} />
                <span className="text-sm font-medium text-white">{activeSection.label} Content</span>
              </div>
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

            {/* Beautiful rendered markdown */}
            <div className={`${activeSection.bgColor} ${activeSection.borderColor} border rounded-xl p-6`}>
              <MarkdownRenderer content={activeSection.content} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">
            <activeSection.icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {activeSection.label.toLowerCase()} suggestions available.</p>
          </div>
        )}
      </div>

      {/* All Sections Collapsible */}
      <div className="border-t border-border/50">
        <div className="p-5">
          <button
            onClick={() => toggleSection('all')}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
          >
            {expandedSections['all'] ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>View All Sections</span>
          </button>

          {expandedSections['all'] && (
            <div className="space-y-3">
              {sections.map((section) => {
                const hasContent = section.content.trim().length > 0;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      activeTab === section.id
                        ? `${section.bgColor} ${section.borderColor}`
                        : 'bg-surface-elevated border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <section.icon className={`w-4 h-4 ${hasContent ? section.color : 'text-slate-600'}`} />
                        <span className={`text-xs font-medium ${hasContent ? 'text-white' : 'text-slate-600'}`}>
                          {section.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasContent && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${section.bgColor} ${section.color}`}>
                            {section.content.trim().split('\n').length} lines
                          </span>
                        )}
                        {hasContent && (
                          <Copy
                            className="w-3.5 h-3.5 text-slate-500 hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(section.content, section.id);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
