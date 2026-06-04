import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
