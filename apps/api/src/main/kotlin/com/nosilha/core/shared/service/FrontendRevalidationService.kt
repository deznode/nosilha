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
     * Triggers revalidation for a directory entry page.
     *
     * Constructs the path as /directory/{category}/{slug} and sends an async
     * POST request to the frontend's revalidation endpoint.
     *
     * @param category The entry category (e.g., "Hotel", "Restaurant")
     * @param slug The entry slug (e.g., "pensao-paulo")
     */
    fun revalidateDirectoryEntry(
        category: String,
        slug: String
    ) {
        val categoryPath = CATEGORY_TO_SLUG[category]
            ?: run {
                logger.warn { "Unknown category '$category', skipping revalidation" }
                return
            }
        val path = "/directory/$categoryPath/$slug"
        revalidatePath(path)
    }

    companion object {
        /**
         * Maps backend category names to frontend URL slugs.
         * Must stay in sync with apps/web/src/lib/directory-utils.ts CATEGORIES.
         */
        private val CATEGORY_TO_SLUG = mapOf(
            "Restaurant" to "restaurants",
            "Hotel" to "hotels",
            "Beach" to "beaches",
            "Heritage" to "heritage",
            "Nature" to "nature",
        )
    }

    /**
     * Triggers revalidation for an arbitrary path.
     *
     * Sends an async HTTP POST request to the frontend's /api/revalidate endpoint.
     * Failures are logged but do not throw exceptions (fire-and-forget pattern).
     *
     * @param path The path to revalidate (e.g., "/directory/hotels/pensao-paulo")
     */
    fun revalidatePath(path: String) {
        if (revalidateSecret.isBlank()) {
            logger.warn { "Skipping revalidation - REVALIDATE_SECRET not configured" }
            return
        }

        val endpoint = "$frontendUrl/api/revalidate"
        val requestBody = """{"path": "$path"}"""

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
                        logger.info { "Successfully revalidated path: $path" }
                    } else {
                        logger.warn {
                            "Revalidation returned non-200 status: ${response.statusCode()} for path: $path"
                        }
                    }
                }.exceptionally { throwable ->
                    logger.error(throwable) { "Failed to revalidate path: $path" }
                    null
                }

            logger.debug { "Sent revalidation request for path: $path" }
        } catch (e: Exception) {
            // Don't let revalidation failures affect the main operation
            logger.error(e) { "Error sending revalidation request for path: $path" }
        }
    }
}
