package com.nosilha.core.gallery.domain

/**
 * Enum representing social media platforms for creator credit attribution.
 *
 * <p>Distinct from {@link ExternalPlatform} which identifies media hosting platforms.
 * CreditPlatform identifies the creator's social profile for attribution links.</p>
 */
enum class CreditPlatform {
    YOUTUBE,
    INSTAGRAM,
    FACEBOOK,
    TWITTER,
    TIKTOK,
}
