/**
 * useSSEStream — Custom Hook for SSE Streaming
 * ==============================================
 * Manages SSE connection state, message accumulation,
 * and reconnection logic for the Forge analysis stream.
 */

import { useState, useRef, useCallback, useEffect } from "react";

export interface SSEStreamState {
  isConnected: boolean;
  isStreaming: boolean;
  messages: string[];
  error: string | null;
  progress: number;
}

export interface UseSSEStreamOptions {
  maxMessages?: number;
}

export function useSSEStream(options: UseSSEStreamOptions = {}) {
  const { maxMessages = 100 } = options;

  const [state, setState] = useState<SSEStreamState>({
    isConnected: false,
    isStreaming: false,
    messages: [],
    error: null,
    progress: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesRef = useRef<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addMessage = useCallback((message: string) => {
    messagesRef.current = [...messagesRef.current, message];
    if (messagesRef.current.length > maxMessages) {
      messagesRef.current = messagesRef.current.slice(-maxMessages);
    }
    setState((prev) => ({
      ...prev,
      messages: [...messagesRef.current],
    }));
  }, [maxMessages]);

  const connect = useCallback(
    (url: string, method: string = "POST", body?: unknown) => {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      messagesRef.current = [];

      setState({
        isConnected: false,
        isStreaming: true,
        messages: [],
        error: null,
        progress: 0,
      });

      // For POST requests with SSE, we use a workaround:
      // Create a fetch request and read the response as a stream
      // since EventSource only supports GET
      if (method === "POST") {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            setState((prev) => ({ ...prev, isConnected: true }));

            const decoder = new TextDecoder();
            let buffer = "";

            const read = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    progress: 100,
                  }));
                  return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.status === "started") continue;
                      if (parsed.message_count !== undefined) continue;

                      if (parsed.analysis_id) {
                        setState((prev) => ({
                          ...prev,
                          isStreaming: false,
                          progress: 100,
                        }));
                        return;
                      }

                      if (typeof parsed === "string") {
                        addMessage(parsed);
                      }
                    } catch {
                      if (data.trim()) {
                        addMessage(data.trim());
                      }
                    }
                  }
                }

                read();
              });
            };

            read();
          })
          .catch((err) => {
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isStreaming: false,
              error: err.message,
            }));
          });
      } else {
        // GET request with EventSource
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
          setState((prev) => ({ ...prev, isConnected: true }));
        };

        es.onmessage = (event: MessageEvent) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.analysis_id && parsed.health_score !== undefined) {
              setState((prev) => ({
                ...prev,
                isStreaming: false,
                progress: 100,
              }));
              return;
            }
            if (typeof parsed === "string") {
              addMessage(parsed);
            }
          } catch {
            if (event.data.trim()) {
              addMessage(event.data.trim());
            }
          }
        };

        es.onerror = () => {
          if (es.readyState === EventSource.CLOSED) {
            setState((prev) => ({
              ...prev,
              isConnected: false,
              isStreaming: false,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              error: "Connection lost",
              isConnected: false,
            }));
          }
        };
      }
    },
    [addMessage]
  );

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isStreaming: false,
    }));
  }, []);

  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setState((prev) => ({ ...prev, messages: [] }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    clearMessages,
    addMessage,
  };
}
