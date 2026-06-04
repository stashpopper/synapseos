/**
 * SynapseForge API Client
 * ========================
 * Client for the SynapseForge multi-agent code analysis API.
 * Supports REST calls and SSE streaming.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Type Definitions ───────────────────────────────────────────

export type AnalysisDepth = "quick" | "standard" | "deep";
export type Severity = "critical" | "high" | "medium" | "low";
export type Category = "security" | "performance" | "quality" | "style" | "architecture";
export type FindingSource = 'pattern' | 'ai';

export interface Finding {
  severity: Severity;
  category: Category;
  title: string;
  file: string;
  line: number | null;
  description: string;
  recommendation: string;
  code_snippet: string | null;
  cwe_id: string | null;
  source?: 'pattern' | 'ai';
}

export interface ScoreBreakdown {
  security: number;
  quality: number;
  performance: number;
}

export interface AnalysisResult {
  analysis_id: string;
  health_score: number | null;
  summary: string | null;
  recommendations: string[];
  score_breakdown: ScoreBreakdown | null;
  findings: Finding[];
  agents: {
    planner: AgentResult | null;
    reviewer: AgentResult | null;
    quality: AgentResult | null;
    security: AgentResult | null;
    performance: AgentResult | null;
    synthesizer: AgentResult | null;
    docs: AgentResult | null;
  };
}

export interface AgentResult {
  agent: string;
  status: string;
  message: string;
  findings: Finding[];
  summary: string | null;
  // Docs agent specific fields
  readme_suggestions?: string;
  api_docs?: string;
  configuration_docs?: string;
  comment_suggestions?: string[];
  test_suggestions?: string;
}

export interface AnalyzeRequest {
  code: string;
  language?: string;
  filename?: string;
  depth?: AnalysisDepth;
}

export interface AnalyzeResponse {
  analysis_id: string;
  status: string;
  health_score: number;
  findings_count: number;
  summary: string;
}

export interface HistoryEntry {
  analysis_id: string;
  health_score: number;
  findings_count: number;
  summary: string;
}

// ─── REST API Functions ─────────────────────────────────────────

/**
 * Submit code for analysis.
 */
export async function analyzeCode(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE}/api/forge/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: request.code,
      language: request.language || "auto",
      filename: request.filename || "code",
      depth: request.depth || "standard",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Analysis failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get analysis results by ID.
 */
export async function getAnalysisResults(
  analysisId: string
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/api/forge/results/${analysisId}`);

  if (!response.ok) {
    throw new Error(`Results not found: ${response.status}`);
  }

  return response.json();
}

/**
 * Get analysis history.
 */
export async function getAnalysisHistory(): Promise<HistoryEntry[]> {
  const response = await fetch(`${API_BASE}/api/forge/history`);

  if (!response.ok) {
    throw new Error(`History fetch failed: ${response.status}`);
  }

  return response.json();
}

// ─── SSE Stream Client ──────────────────────────────────────────

export interface StreamCallbacks {
  onMessage: (message: string) => void;
  onComplete: (data: {
    analysis_id: string;
    health_score: number;
    summary: string;
    recommendations: string[];
    score_breakdown: ScoreBreakdown;
    findings: Finding[];
  }) => void;
  onError: (error: Error) => void;
  onConnect: () => void;
}

/**
 * Connect to the SSE streaming endpoint and stream analysis progress.
 */
export function connectToAnalysisStream(
  _request: AnalyzeRequest,
  callbacks: StreamCallbacks
): EventSource {
  const url = `${API_BASE}/api/forge/stream`;

  let eventSource: EventSource | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 3;

  const attemptConnect = () => {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      callbacks.onConnect();
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.status === "started") {
          return;
        }

        if (parsed.message_count !== undefined) {
          return;
        }

        // Check if this is a complete event
        if (parsed.analysis_id && parsed.health_score !== undefined) {
          callbacks.onComplete(parsed);
          eventSource?.close();
          eventSource = null;
          return;
        }

        // Regular message
        if (typeof parsed === "string") {
          callbacks.onMessage(parsed);
        }
      } catch (err) {
        // Try treating as raw message
        try {
          callbacks.onMessage(event.data);
        } catch {
          // Ignore parse errors for non-JSON messages
        }
      }
    };

    eventSource.onerror = (_errorEvent: Event) => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        return;
      }

      reconnectAttempts++;

      if (reconnectAttempts >= maxReconnectAttempts) {
        callbacks.onError(
          new Error(
            `Stream connection failed after ${maxReconnectAttempts} attempts.`
          )
        );
        eventSource?.close();
        eventSource = null;
        return;
      }

      console.warn(
        `[Forge] SSE disconnected (attempt ${reconnectAttempts}/${maxReconnectAttempts}). Reconnecting...`
      );
    };
  };

  attemptConnect();
  return eventSource!;
}
