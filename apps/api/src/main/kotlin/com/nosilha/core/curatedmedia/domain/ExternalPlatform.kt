package com.nosilha.core.curatedmedia.domain

/**
 * Enum representing the external platform hosting the curated media.
 *
 * <p>Identifies the source platform for embedded or externally-hosted media content.</p>
 *
 * <ul>
 *   <li>YOUTUBE: YouTube video platform</li>
 *   <li>VIMEO: Vimeo video platform</li>
 *   <li>SOUNDCLOUD: SoundCloud audio platform</li>
 *   <li>SELF_HOSTED: Content hosted on Nos Ilha infrastructure or external URLs</li>
 * </ul>
 */
enum class ExternalPlatform {
    /**
     * YouTube video platform.
     * Supports ID-based embedding via youtube.com/embed/{id}.
     */
    YOUTUBE,

    /**
     * Vimeo video platform.
     * Supports ID-based embedding via player.vimeo.com/video/{id}.
     */
    VIMEO,

    /**
     * SoundCloud audio platform.
     * Requires full embed URL.
     */
    SOUNDCLOUD,

    /**
     * Content hosted on Nos Ilha infrastructure or external URLs.
     * Uses the url field directly.
     */
    SELF_HOSTED
}
