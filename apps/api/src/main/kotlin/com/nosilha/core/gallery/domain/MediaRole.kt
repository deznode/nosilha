package com.nosilha.core.gallery.domain

/**
 * What a gallery record is for (spec 034, FR-023).
 *
 * Maps to the PostgreSQL enum `gallery_media_role`; a new value needs a migration.
 */
enum class MediaRole {
    /** A photograph or film in the archive. */
    ARCHIVE,

    /** A directory entry's hero image. At most one per entry, and always tied to one. */
    HERO,
}
