package com.nosilha.core.gallery.domain

/**
 * Result of parsing a raw credit input string.
 *
 * @property displayName The cleaned display name (e.g., "@nosilha" or "João Silva")
 * @property platform Detected social platform, or null for plain names
 * @property handle Normalized handle without @ prefix, or null for plain names
 */
data class ParsedCredit(
    val displayName: String,
    val platform: CreditPlatform? = null,
    val handle: String? = null,
)

/**
 * Parses raw credit input text into structured credit data.
 *
 * <p>Detects social media URLs and @handle shorthands, extracting the platform
 * and normalized handle. Falls back to treating the input as a plain display name.</p>
 *
 * <p>Detection priority: full URL → shorthand → plain name.</p>
 */
object CreditParser {
    private data class PlatformPattern(
        val platform: CreditPlatform,
        val urlPatterns: List<Regex>,
        val shorthands: List<String>,
    )

    private val platformPatterns = listOf(
        PlatformPattern(
            platform = CreditPlatform.YOUTUBE,
            urlPatterns = listOf(
                Regex("""(?:https?://)?(?:www\.)?youtube\.com/@?([\w\-.]+)""", RegexOption.IGNORE_CASE),
                Regex("""(?:https?://)?(?:www\.)?youtu\.be/@?([\w\-.]+)""", RegexOption.IGNORE_CASE),
            ),
            shorthands = listOf("youtube", "yt"),
        ),
        PlatformPattern(
            platform = CreditPlatform.INSTAGRAM,
            urlPatterns = listOf(
                Regex("""(?:https?://)?(?:www\.)?instagram\.com/([\w\-.]+)""", RegexOption.IGNORE_CASE),
            ),
            shorthands = listOf("instagram", "ig"),
        ),
        PlatformPattern(
            platform = CreditPlatform.FACEBOOK,
            urlPatterns = listOf(
                Regex("""(?:https?://)?(?:www\.)?facebook\.com/([\w\-.]+)""", RegexOption.IGNORE_CASE),
                Regex("""(?:https?://)?(?:www\.)?fb\.com/([\w\-.]+)""", RegexOption.IGNORE_CASE),
            ),
            shorthands = listOf("facebook", "fb"),
        ),
        PlatformPattern(
            platform = CreditPlatform.TWITTER,
            urlPatterns = listOf(
                Regex("""(?:https?://)?(?:www\.)?(?:twitter|x)\.com/@?([\w\-.]+)""", RegexOption.IGNORE_CASE),
            ),
            shorthands = listOf("twitter", "x"),
        ),
        PlatformPattern(
            platform = CreditPlatform.TIKTOK,
            urlPatterns = listOf(
                Regex("""(?:https?://)?(?:www\.)?tiktok\.com/@?([\w\-.]+)""", RegexOption.IGNORE_CASE),
            ),
            shorthands = listOf("tiktok"),
        ),
    )

    private val shorthandPattern = Regex("""^(\w+)/@?([\w\-.]+)$""", RegexOption.IGNORE_CASE)

    /**
     * Parses a raw credit string into structured credit data.
     *
     * @param raw The raw credit input (URL, shorthand, or plain name)
     * @return ParsedCredit with platform and handle if detected, otherwise plain name
     */
    fun parseCredit(raw: String): ParsedCredit {
        val trimmed = raw.trim()
        if (trimmed.isBlank()) {
            return ParsedCredit(displayName = "")
        }

        val cleaned = trimmed
            .removeSuffix("/")
            .substringBefore("?")

        // Try full URL match
        for (pp in platformPatterns) {
            for (urlPattern in pp.urlPatterns) {
                val match = urlPattern.find(cleaned)
                if (match != null) {
                    val handle = normalizeHandle(match.groupValues[1])
                    return ParsedCredit(
                        displayName = "@$handle",
                        platform = pp.platform,
                        handle = handle,
                    )
                }
            }
        }

        // Try shorthand match (e.g., "ig/@handle", "youtube/@handle")
        val shorthandMatch = shorthandPattern.find(cleaned)
        if (shorthandMatch != null) {
            val prefix = shorthandMatch.groupValues[1].lowercase()
            val handle = normalizeHandle(shorthandMatch.groupValues[2])
            for (pp in platformPatterns) {
                if (prefix in pp.shorthands) {
                    return ParsedCredit(
                        displayName = "@$handle",
                        platform = pp.platform,
                        handle = handle,
                    )
                }
            }
        }

        // Plain name fallback
        return ParsedCredit(displayName = trimmed)
    }

    private fun normalizeHandle(handle: String): String = handle.removePrefix("@").lowercase()
}
