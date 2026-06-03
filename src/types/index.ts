export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  gradient?: 'primary' | 'secondary' | 'mixed';
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
}

export interface TerminalStep {
  id: number;
  line: string;
  delay: number;
  type: 'command' | 'output' | 'success' | 'error' | 'info';
}

export interface PlaygroundScenario {
  id: string;
  label: string;
  prompt: string;
  expectedTokens: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface MarqueeItem {
  id: string;
  name: string;
  logo?: string;
}

// ─── SynapseForge Types ───────────────────────────────────────

export type ForgeSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ForgeCategory = 'security' | 'performance' | 'quality' | 'style' | 'architecture';
export type ForgeAgent = 'planner' | 'reviewer' | 'security' | 'performance' | 'synthesizer' | 'docs';

export interface ForgeFinding {
  severity: ForgeSeverity;
  category: ForgeCategory;
  title: string;
  file: string;
  line: number | null;
  description: string;
  recommendation: string;
  code_snippet: string | null;
  cwe_id: string | null;
}

export interface ForgeScoreBreakdown {
  security: number;
  quality: number;
  performance: number;
}

export interface ForgeAgentResult {
  agent: ForgeAgent;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  findings: ForgeFinding[];
  summary: string | null;
}

export interface ForgeAnalysisResult {
  analysis_id: string;
  health_score: number;
  summary: string;
  recommendations: string[];
  score_breakdown: ForgeScoreBreakdown;
  findings: ForgeFinding[];
  agents: Record<ForgeAgent, ForgeAgentResult | null>;
}
