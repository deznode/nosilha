"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#0a0f1a",
          color: "#e2e8f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "0.75rem" }}>
            A critical error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <pre
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#1e293b",
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "#94a3b8",
                textAlign: "left",
                maxWidth: "32rem",
                overflow: "auto",
              }}
            >
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.25rem",
              backgroundColor: "#38bdf8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
