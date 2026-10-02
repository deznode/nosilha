/**
 * Error thrown by API client methods that need to expose the HTTP status and,
 * for a 429 response, how long to wait before retrying.
 *
 * Still an `Error` — existing `catch (err) { if (err instanceof Error) ... }`
 * callers are unaffected. Callers that need the status or retry timing narrow
 * with `err instanceof ApiError`. Spec 039.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    // Keeps `instanceof ApiError` working when the class is subclassed or the
    // output is downlevel-compiled, since built-ins don't extend cleanly otherwise.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Parses a `Retry-After` header into whole seconds.
 *
 * Accepts the delay-seconds form ("120") per RFC 9110 §10.2.3, and the
 * HTTP-date form (e.g. "Wed, 21 Oct 2026 07:28:00 GMT"), converting it to the
 * seconds remaining from now. Returns `undefined` for a missing, malformed,
 * or already-elapsed value.
 */
export function parseRetryAfterSeconds(
  value: string | null | undefined
): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;

  if (/^\d+$/.test(trimmed)) {
    const seconds = parseInt(trimmed, 10);
    return seconds > 0 ? seconds : undefined;
  }

  const dateMs = Date.parse(trimmed);
  if (Number.isNaN(dateMs)) return undefined;

  const seconds = Math.ceil((dateMs - Date.now()) / 1000);
  return seconds > 0 ? seconds : undefined;
}

/**
 * Builds an {@link ApiError} from a failed `fetch` `Response`, reading
 * `retryAfterSeconds` from its `Retry-After` header. The message comes from
 * the caller: `apiErrorFrom` in `backend-api.ts` reads it from the error body
 * (via `apiErrorMessage`) before calling this.
 */
export function apiErrorFromResponse(
  response: Response,
  message: string
): ApiError {
  return new ApiError(
    message,
    response.status,
    parseRetryAfterSeconds(response.headers.get("Retry-After"))
  );
}
