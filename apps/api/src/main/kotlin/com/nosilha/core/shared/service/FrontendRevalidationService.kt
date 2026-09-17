package com.nosilha.core.shared.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

private val logger = KotlinLogging.logger {}

/**
 * Service for triggering on-demand ISR cache revalidation on the frontend.
 *
 * This service is used after admin actions that modify content (e.g., promoting
 * a gallery image to hero image) to ensure users see updated content immediately
 * rather than waiting for the ISR cache to expire.
 *
 * The revalidation call is made asynchronously (fire-and-forget) to avoid
 * blocking the main operation if the frontend is temporarily unavailable.
 *
 * Configuration:
 * - FRONTEND_URL: Base URL of the frontend (e.g., http://localhost:3000)
 * - REVALIDATE_SECRET: Shared secret for authenticating revalidation requests
 */
@Service
class FrontendRevalidationService(
    @Value("\${nosilha.frontend.url:http://localhost:3000}")
    private val frontendUrl: String,
    @Value("\${nosilha.frontend.revalidate-secret:}")
    private val revalidateSecret: String,
) {
    private val httpClient: HttpClient = HttpClient
        .newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build()

    /**
     * Triggers revalidation for every page that shows directory entries.
     *
     * A record's page lives at `/<town>/<entry>` and the settlement, Stay and home
     * pages list records too (spec 034 FR-015); all of them carry the `directory`
     * cache tag, so one tag reaches every copy of the record.
     */
    fun revalidateDirectoryEntries() {
        revalidate("""{"tag": "$DIRECTORY_TAG"}""", "tag $DIRECTORY_TAG")
    }

    /**
     * Sends an async HTTP POST request to the frontend's /api/revalidate endpoint.
     * Failures are logged but do not throw exceptions (fire-and-forget pattern).
     */
    private fun revalidate(
        requestBody: String,
        target: String,
    ) {
        if (revalidateSecret.isBlank()) {
            logger.warn { "Skipping revalidation - REVALIDATE_SECRET not configured" }
            return
        }

        val endpoint = "$frontendUrl/api/revalidate"

        try {
            val request = HttpRequest
                .newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("X-Revalidate-Secret", revalidateSecret)
                .timeout(Duration.ofSeconds(10))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build()

            // Fire-and-forget: use sendAsync to avoid blocking
            httpClient
                .sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept { response ->
                    if (response.statusCode() == 200) {
                        logger.info { "Successfully revalidated $target" }
                    } else {
                        logger.warn {
                            "Revalidation returned non-200 status: ${response.statusCode()} for $target"
                        }
                    }
                }.exceptionally { throwable ->
                    logger.error(throwable) { "Failed to revalidate $target" }
                    null
                }

            logger.debug { "Sent revalidation request for $target" }
        } catch (e: Exception) {
            // Don't let revalidation failures affect the main operation
            logger.error(e) { "Error sending revalidation request for $target" }
        }
    }

    private companion object {
        /** The cache tag every page listing directory entries carries. */
        const val DIRECTORY_TAG = "directory"
    }
}
