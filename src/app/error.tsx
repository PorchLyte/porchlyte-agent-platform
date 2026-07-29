"use client";

/** Catch-all error boundary. PlatformError messages are already member-safe;
 * anything else gets a generic message rather than a raw stack trace. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    error.name === "PlatformError" ? error.message : "Something went wrong on our end.";

  return (
    <main style={{ maxWidth: "28rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Something went wrong</h1>
      <p>{message}</p>
      <button
        type="button"
        onClick={reset}
        style={{ marginTop: "1.5rem", padding: "0.5rem 1rem" }}
      >
        Try again
      </button>
    </main>
  );
}
