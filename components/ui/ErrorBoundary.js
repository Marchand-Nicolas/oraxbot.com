import React from "react";
import { notify } from "./NotificationSystem";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Show notification for the error
    if (typeof window !== "undefined") {
      notify.error(
        "Application Error",
        "An unexpected error occurred. The page will reload automatically.",
        {
          duration: 8000,
          autoClose: false,
        }
      );

      // Auto-reload after a delay to recover from the error
      setTimeout(() => {
        window.location.reload();
      }, 8000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: "2rem",
            textAlign: "center",
            color: "#ffffff",
            background: "rgba(239, 68, 68, 0.5)",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            backdropFilter: "blur(10px)",
            margin: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              margin: "0 0 2rem 0",
              opacity: 0.8,
              maxWidth: "400px",
              lineHeight: "1.5",
            }}
          >
            An unexpected error occurred while loading this component. The page
            will reload automatically in a few seconds.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--primary, #8151fc)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                color: "rgba(255, 255, 255, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.color = "rgba(255, 255, 255, 1)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "rgba(255, 255, 255, 0.8)";
              }}
            >
              Try Again
            </button>
          </div>
          {this.state.error && (
            <details
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                fontSize: "0.875rem",
                textAlign: "left",
                maxWidth: "600px",
                overflow: "auto",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  marginBottom: "1rem",
                  fontWeight: "600",
                }}
              >
                Error Details
              </summary>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#ff6b6b",
                }}
              >
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre
                  style={{
                    margin: "1rem 0 0 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.8rem",
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
