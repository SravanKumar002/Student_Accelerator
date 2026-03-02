/**
 * ============================================================================
 * ERROR BOUNDARY — Global Crash Handler
 * ============================================================================
 *
 * React Error Boundaries must be class components.
 * If ANY child component throws during rendering, this boundary catches
 * the error and shows a friendly fallback UI instead of a white screen.
 *
 * USAGE:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface Props {
  children: ReactNode;
}

interface State {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error message (if any) */
  error: Error | null;
}

// =============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// =============================================================================

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Called when a child component throws.
   * Updates state so the next render shows the fallback UI.
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Logs the error for debugging / monitoring.
   * In production you might send this to Sentry, LogRocket, etc.
   */
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  /** Reset error state so the user can try again */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold font-display text-foreground">
              Something went wrong
            </h1>

            {/* Message */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              An unexpected error occurred. You can try refreshing the page or
              clicking the button below.
            </p>

            {/* Error detail (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-xs text-left bg-muted p-4 rounded-lg overflow-auto max-h-40 text-destructive">
                {this.state.error.message}
              </pre>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
