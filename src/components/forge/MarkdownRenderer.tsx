/**
 * MarkdownRenderer — Clean, readable markdown rendering
 * ======================================================
 * Strips all decorative chrome. Just clean, readable content.
 */

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <p className="text-slate-500 italic text-sm">No content available.</p>;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-emerald-400 mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-cyan-400 mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-violet-400 mt-3 mb-1.5">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold text-slate-400 mt-2 mb-1">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold text-slate-500 mt-2 mb-1">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-400 italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors">
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-') || className?.includes('hljs');
            if (isBlock) return null;
            return (
              <code className="text-amber-300 font-mono text-sm">{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-4 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 overflow-x-auto text-sm text-slate-300 leading-relaxed">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-3 pl-6 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-3 pl-6 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300 leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <table className="w-full text-sm my-4 border-collapse">{children}</table>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-slate-600/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-white">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 text-slate-300 border-t border-slate-700/30">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-2 border-primary/30 text-slate-400 italic">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-6 border-slate-700/50" />
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="my-4 max-w-full" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
