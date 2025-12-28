package com.nosilha.core.curatedmedia.domain

/**
 * Enum representing the type of curated media.
 *
 * <p>Defines the primary media category for curated content in the gallery.</p>
 *
 * <ul>
 *   <li>IMAGE: Static images (photos, artwork, historical photos)</li>
 *   <li>VIDEO: Video content (YouTube, Vimeo, self-hosted)</li>
 *   <li>AUDIO: Audio content (podcasts, interviews, music)</li>
 * </ul>
 */
enum class MediaType {
    /**
     * Static images (photos, artwork, historical photos).
     */
    IMAGE,

    /**
     * Video content (YouTube, Vimeo, self-hosted).
     */
    VIDEO,

    /**
     * Audio content (podcasts, interviews, music).
     */
    AUDIO
}
