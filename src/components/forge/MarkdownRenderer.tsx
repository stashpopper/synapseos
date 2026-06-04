/**
 * MarkdownRenderer — Beautiful markdown rendering for docs
 * =========================================================
 * Renders markdown content with rich, colorful styling inspired by
 * professional word processors. Supports headings, code, lists,
 * tables, bold/italic, blockquotes, and more.
 */

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <p className="text-slate-500 italic text-sm">No content available.</p>;
  }

  return (
    <div className={cn('markdown-content prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-6 mb-4 pb-3 border-b-2 border-primary/30 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm">
                {children?.toString()?.charAt(0)}
              </span>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-emerald-400 mt-6 mb-3 pb-2 border-b border-emerald-400/20 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-400/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                {children?.toString()?.charAt(0)}
              </span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-cyan-400 mt-4 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-cyan-400/20 flex items-center justify-center text-cyan-400 text-[10px] font-bold">
                {children?.toString()?.charAt(0)}
              </span>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-violet-400 mt-3 mb-1.5">{children}</h4>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-3">{children}</p>
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="text-slate-400 italic">{children}</em>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary-dim transition-colors"
            >
              {children}
            </a>
          ),
          // Code (inline)
          code: ({ className, children }) => {
            const isBlock = className?.includes('language-') || className?.includes('hljs');
            if (isBlock) return null; // Block codes handled by pre
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-700/60 text-amber-300 text-xs font-mono border border-slate-600/50">
                {children}
              </code>
            );
          },
          // Code blocks
          pre: ({ children }) => (
            <div className="relative my-4 rounded-xl overflow-hidden border border-slate-600/50 bg-slate-900/80">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2 font-mono">code</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 leading-relaxed">{children}</pre>
              </div>
            </div>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="space-y-2 my-3 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-3 pl-2 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300 leading-relaxed flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>{children}</span>
            </li>
          ),
          // Tables
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-600/50">
              <table className="w-full text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/10">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-white border-b border-slate-600/50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-slate-300 border-b border-slate-700/30">
              {children}
            </td>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 py-3 border-l-4 border-primary/40 bg-primary/5 rounded-r-lg">
              <p className="text-slate-400 italic">{children}</p>
            </blockquote>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-slate-600/50" />
          ),
          // Definition lists
          dl: ({ children }) => (
            <dl className="my-4 space-y-3">
              {children}
            </dl>
          ),
          dt: ({ children }) => (
            <dt className="font-semibold text-white">{children}</dt>
          ),
          dd: ({ children }) => (
            <dd className="text-slate-400 ml-4">{children}</dd>
          ),
          // Image
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="my-4 rounded-xl border border-slate-600/50 max-w-full"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
