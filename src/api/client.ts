/**
 * SynapseOS API Client
 * ====================
 * Native TypeScript client for the FastAPI backend.
 * Uses EventSource for SSE streaming and fetch for REST endpoints.
 * Includes robust reconnection and error-handling logic.
 */

// ─── Type Definitions ───────────────────────────────────────────

export type InferenceMode = "standard" | "turbo";

export type ScenarioId = "code-gen" | "analysis" | "creative";

export interface StreamMetric {
  token_count: number;
  characters_streamed: number;
  tokens_per_second: number;
  latency_ms: number;
  is_complete: boolean;
}

export interface StreamChunk {
  text: string;
  metrics: StreamMetric;
}

export interface StreamComplete {
  text: string;
  metrics: StreamMetric;
  total_tokens: number;
  total_characters: number;
  total_latency_ms: number;
  avg_tokens_per_second: number;
}

export interface ScenarioMetadata {
  id: ScenarioId;
  label: string;
  prompt: string;
  response_steps: string[];
  code_snippet: string;
}

export interface HardwareStatus {
  model: string;
  engine: string;
  vram_total_gb: number;
  vram_used_gb: number;
  vram_free_gb: number;
  cpu_usage_pct: number;
  gpu_usage_pct: number;
  active_sessions: number;
  uptime_seconds: number;
}

export interface SystemConfigResponse {
  status: string;
  applied_features: Array<{
    id: string;
    enabled: boolean;
    priority: number;
  }>;
  inference_mode: InferenceMode;
  max_tokens: number;
  temperature: number;
  hardware: HardwareStatus;
}

export interface SystemStatus {
  status: string;
  version: string;
  engine: string;
  hardware: HardwareStatus;
}

// ─── Configuration ──────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── SSE Stream Client ──────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (chunk: StreamChunk) => void;
  onComplete: (data: StreamComplete) => void;
  onError: (error: Error) => void;
  onConnect: () => void;
}

/**
 * Connect to the SSE streaming endpoint and stream response data.
 *
 * Returns an EventSource instance so the caller can close it at will.
 * Handles reconnection automatically via EventSource's built-in
 * retry logic, plus custom error state management.
 */
export function connectToStream(
  scenario: ScenarioId,
  callbacks: StreamCallbacks,
  options?: {
    custom_prompt?: string;
    inference_mode?: InferenceMode;
    max_tokens?: number;
  }
): EventSource {
  const query = new URLSearchParams({
    scenario,
  });

  if (options?.custom_prompt) {
    query.set("custom_prompt", options.custom_prompt);
  }

  if (options?.inference_mode) {
    query.set("inference_mode", options.inference_mode);
  }

  if (options?.max_tokens) {
    query.set("max_tokens", String(options.max_tokens));
  }

  const url = `${API_BASE}/api/stream-playground?${query.toString()}`;

  let eventSource: EventSource | null = null;
  let accumulatedText = "";
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

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
        const parsed = JSON.parse(event.data) as StreamChunk;

        if (parsed.metrics.is_complete) {
          // Final chunk — compute aggregates
          const completeData: StreamComplete = {
            text: accumulatedText,
            metrics: parsed.metrics,
            total_tokens: parsed.metrics.token_count,
            total_characters: accumulatedText.length,
            total_latency_ms: parsed.metrics.latency_ms,
            avg_tokens_per_second: parsed.metrics.tokens_per_second,
          };

          callbacks.onComplete(completeData);
          eventSource?.close();
          eventSource = null;
          return;
        }

        accumulatedText += parsed.text;

        callbacks.onChunk({
          text: parsed.text,
          metrics: {
            ...parsed.metrics,
            characters_streamed: accumulatedText.length,
          },
        });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(`Failed to parse SSE chunk: ${String(err)}`);
        callbacks.onError(error);
      }
    };

    eventSource.onerror = (_errorEvent: Event) => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        // Explicitly closed by caller — not an error
        return;
      }

      reconnectAttempts++;

      if (reconnectAttempts >= maxReconnectAttempts) {
        const error = new Error(
          `SSE connection failed after ${maxReconnectAttempts} attempts. The backend may be unavailable.`
        );
        callbacks.onError(error);
        eventSource?.close();
        eventSource = null;
        return;
      }

      // EventSource auto-reconnects by default after 3 seconds.
      // We log but let the browser handle the retry.
      console.warn(
        `[SynapseOS] SSE disconnected (attempt ${reconnectAttempts}/${maxReconnectAttempts}). Reconnecting...`
      );
    };
  };

  attemptConnect();

  return eventSource!;
}

/**
 * Disconnect from the active SSE stream.
 */
export function disconnectFromStream(eventSource: EventSource | null): void {
  if (eventSource) {
    eventSource.close();
  }
}

// ─── REST Client Functions ──────────────────────────────────────

/**
 * Fetch hardware status and engine metadata.
 */
export async function fetchStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE}/api/status`);
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update system configuration (feature toggles, inference mode, etc.).
 */
export async function updateConfig(payload: {
  features?: Array<{ id: string; enabled: boolean; priority: number }>;
  inference_mode?: InferenceMode;
  max_tokens?: number;
  temperature?: number;
}): Promise<SystemConfigResponse> {
  const response = await fetch(`${API_BASE}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Config update failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all available scenario definitions.
 */
export async function fetchScenarios(): Promise<ScenarioMetadata[]> {
  const response = await fetch(`${API_BASE}/api/scenarios`);
  if (!response.ok) {
    throw new Error(`Scenarios fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
