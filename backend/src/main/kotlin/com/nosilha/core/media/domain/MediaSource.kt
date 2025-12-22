package com.nosilha.core.media.domain

/**
 * Represents the origin of the uploaded media.
 *
 * Currently supports direct uploads (LOCAL), with cloud import sources
 * (Google Photos, Adobe Lightroom) deferred to Phase 2.
 */
enum class MediaSource {
    /** Direct upload from user's device. */
    LOCAL,

    /** Imported from Google Photos (Phase 2). */
    GOOGLE_PHOTOS,

    /** Imported from Adobe Lightroom (Phase 2). */
    ADOBE_LIGHTROOM,
}
