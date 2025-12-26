package com.nosilha.core.shared.util

import org.owasp.html.HtmlPolicyBuilder

/**
 * Content sanitizer for preventing XSS attacks in user-submitted content.
 *
 * Uses OWASP Java HTML Sanitizer library to strip or escape potentially
 * dangerous HTML/JavaScript content while allowing safe formatting elements.
 *
 * @see [OWASP Java HTML Sanitizer](https://github.com/OWASP/java-html-sanitizer)
 */
object ContentSanitizer {
    /**
     * Policy allowing basic formatting elements only.
     * Suitable for user-generated content like stories and suggestions.
     */
    private val formattingPolicy = HtmlPolicyBuilder()
        .allowElements("p", "br", "b", "i", "em", "strong", "ul", "ol", "li")
        .toFactory()

    /**
     * Sanitizes content allowing basic formatting elements.
     *
     * Allows: p, br, b, i, em, strong, ul, ol, li
     * Removes: All other HTML tags including script, style, onclick handlers, etc.
     *
     * @param input Raw user input that may contain HTML/script
     * @return Sanitized content safe for storage and display
     */
    fun sanitize(input: String): String = formattingPolicy.sanitize(input)

    /**
     * Strict sanitization that removes all HTML tags.
     *
     * Use for fields that should never contain HTML: names, titles, slugs.
     *
     * @param input Raw user input
     * @return Plain text with all HTML stripped
     */
    fun sanitizeStrict(input: String): String {
        // Remove all HTML tags for strict text-only fields
        return input.replace(Regex("<[^>]*>"), "").trim()
    }
}
