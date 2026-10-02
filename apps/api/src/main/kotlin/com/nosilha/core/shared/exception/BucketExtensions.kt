package com.nosilha.core.shared.exception

import io.github.bucket4j.Bucket

/**
 * Consumes one token from this bucket, or throws [RateLimitExceededException] when it is empty.
 *
 * The exception's `retryAfterSeconds` comes from the probe's refill wait, so the handler can
 * send a `Retry-After` header.
 *
 * @param message Exception message returned to the caller
 * @param onRejected Runs before the throw, e.g. to log the rejected request
 * @throws RateLimitExceededException if no token is available
 */
inline fun Bucket.consumeOrThrow(
    message: String,
    onRejected: () -> Unit = {},
) {
    val probe = tryConsumeAndReturnRemaining(1)
    if (!probe.isConsumed) {
        onRejected()
        throw RateLimitExceededException(
            message,
            retryAfterSeconds = RateLimitExceededException.retryAfterSecondsFrom(probe.nanosToWaitForRefill),
        )
    }
}
