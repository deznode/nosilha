package com.nosilha.core.shared.util

import jakarta.servlet.http.HttpServletRequest

/**
 * Extracts the client IP address from the request.
 *
 * When behind a GCP External Application Load Balancer (e.g. Cloud Run),
 * the LB appends two IPs to X-Forwarded-For: the real client IP and the
 * LB's own forwarding-rule IP. The header format is:
 *
 *   [spoofed-values..., ] <real-client-ip>, <gcp-lb-ip>
 *
 * The leftmost entry is client-supplied and can be spoofed. The rightmost
 * entry is the GCP LB's own IP (not the client). The second-to-last
 * (penultimate) entry is the real client IP as observed by the GCP LB.
 *
 * @see <a href="https://cloud.google.com/load-balancing/docs/https">GCP External ALB docs</a>
 * @return the client IP address, or null if unavailable
 */
fun extractClientIp(request: HttpServletRequest): String? {
    val xff = request.getHeader("X-Forwarded-For")
        ?: return request.remoteAddr
    val parts = xff.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    return when {
        parts.size >= 2 -> parts[parts.size - 2]
        parts.size == 1 -> parts[0]
        else -> request.remoteAddr
    }
}
