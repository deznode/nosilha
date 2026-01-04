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
     *
     * <p><strong>Security:</strong> Uses OWASP HTML Sanitizer which properly handles:</p>
     * <ul>
     *   <li>Nested tags and malformed HTML</li>
     *   <li>JavaScript event handlers (onclick, onerror, etc.)</li>
     *   <li>Data URIs and javascript: protocol</li>
     *   <li>CSS injection via style attributes</li>
     * </ul>
     */
    private val formattingPolicy =
        HtmlPolicyBuilder()
            .allowElements("p", "br", "b", "i", "em", "strong", "ul", "ol", "li")
            .toFactory()

    /**
     * Strict policy that removes ALL HTML tags.
     *
     * <p><strong>Security:</strong> Using an empty HtmlPolicyBuilder produces a policy
     * that strips all HTML while properly handling edge cases like:</p>
     * <ul>
     *   <li>Nested/unclosed tags: &lt;scr&lt;script&gt;ipt&gt;</li>
     *   <li>Null bytes: &lt;scr\u0000ipt&gt;</li>
     *   <li>Entity encoding: &amp;lt;script&amp;gt;</li>
     *   <li>Mixed encoding attacks</li>
     * </ul>
     *
     * <p>This is more secure than regex-based stripping which can be bypassed.</p>
     */
    private val strictPolicy = HtmlPolicyBuilder().toFactory()

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
     * <p><strong>Note:</strong> Uses OWASP HTML Sanitizer with empty policy for
     * robust XSS prevention. This is more secure than regex-based stripping.</p>
     *
     * @param input Raw user input
     * @return Plain text with all HTML stripped
     */
    fun sanitizeStrict(input: String): String = strictPolicy.sanitize(input).trim()
}
