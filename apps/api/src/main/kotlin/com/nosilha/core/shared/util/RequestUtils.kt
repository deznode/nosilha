package com.nosilha.core.shared.util

import jakarta.servlet.http.HttpServletRequest

/**
 * Extracts the client IP address from the request.
 *
 * When behind a reverse proxy (e.g. GCP Cloud Run), the proxy appends
 * the real client IP to the X-Forwarded-For header. The rightmost entry
 * is added by the trusted proxy and is the most reliable. The leftmost
 * entry is client-supplied and can be spoofed.
 *
 * @return the client IP address, or null if unavailable
 */
fun extractClientIp(request: HttpServletRequest): String? {
    val xff = request.getHeader("X-Forwarded-For")
        ?: return request.remoteAddr
    return xff.split(",").lastOrNull()?.trim() ?: request.remoteAddr
}
