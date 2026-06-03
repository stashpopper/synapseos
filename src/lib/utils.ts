/**
 * Utility functions
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function detectLanguage(code: string): string {
  const indicators: Record<string, string[]> = {
    python: ['import ', 'def ', 'class ', 'print(', 'self.', 'pip'],
    javascript: ['function ', 'const ', 'let ', 'var ', 'console.log', 'require('],
    typescript: ['interface ', 'type ', 'enum ', 'implements', 'extends '],
    java: ['public class ', 'private ', 'protected ', 'System.out'],
    go: ['package ', 'func ', 'fmt.', 'import ('],
    rust: ['fn ', 'struct ', 'impl ', 'use ', 'pub '],
    ruby: ['def ', 'end', 'require ', 'puts '],
    php: ['<?php', 'function ', '$_', '->'],
  };

  const scores: Record<string, number> = {};
  for (const [lang, keywords] of Object.entries(indicators)) {
    scores[lang] = keywords.filter((kw) => code.toLowerCase().includes(kw)).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : 'unknown';
}
