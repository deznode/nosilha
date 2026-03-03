package com.nosilha.core.gallery.api.dto

import java.time.Instant

/**
 * Response DTO containing a presigned URL for direct R2 upload.
 *
 * @property uploadUrl Presigned PUT URL for direct browser-to-R2 upload
 * @property key Storage key to use in confirm request
 * @property expiresAt When the presigned URL expires (typically 10 minutes)
 */
data class PresignResponse(
    val uploadUrl: String,
    val key: String,
    val expiresAt: Instant,
)
