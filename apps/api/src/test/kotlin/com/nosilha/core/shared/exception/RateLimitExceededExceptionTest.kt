package com.nosilha.core.shared.exception

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

/**
 * Pure unit tests for [RateLimitExceededException]'s `Retry-After` math (spec 039 T-02).
 */
class RateLimitExceededExceptionTest {
    @Test
    @DisplayName("Existing single-argument callers still compile and default retryAfterSeconds to null")
    fun `constructor without retryAfterSeconds defaults to null`() {
        val ex = RateLimitExceededException("Rate limit exceeded")

        assertThat(ex.message).isEqualTo("Rate limit exceeded")
        assertThat(ex.retryAfterSeconds).isNull()
    }

    @Test
    @DisplayName("retryAfterSeconds is carried through when supplied")
    fun `constructor with retryAfterSeconds carries it through`() {
        val ex = RateLimitExceededException("Rate limit exceeded", retryAfterSeconds = 42L)

        assertThat(ex.retryAfterSeconds).isEqualTo(42L)
    }

    @Test
    @DisplayName("Whole seconds round trip without rounding")
    fun `retryAfterSecondsFrom converts whole seconds exactly`() {
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(5_000_000_000L)).isEqualTo(5L)
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(1_000_000_000L)).isEqualTo(1L)
    }

    @Test
    @DisplayName("A partial second is rounded up")
    fun `retryAfterSecondsFrom rounds up a partial second`() {
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(1_000_000_001L)).isEqualTo(2L)
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(500_000_000L)).isEqualTo(1L)
    }

    @Test
    @DisplayName("Zero or negative waits still report at least 1 second")
    fun `retryAfterSecondsFrom never returns less than 1`() {
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(0L)).isEqualTo(1L)
        assertThat(RateLimitExceededException.retryAfterSecondsFrom(-1L)).isEqualTo(1L)
    }
}
