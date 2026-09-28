package com.nosilha.core.gallery.api.dto

import com.fasterxml.jackson.annotation.JsonInclude
import java.util.UUID

/**
 * Result of a duplicate check for an external film submission, by platform and external id
 * (spec 039). Matches `GET /api/v1/gallery/submissions/lookup`.
 *
 * - `public` means an ACTIVE row — safe to link to, so `id` and `url` are included.
 * - `pending` means a PENDING_REVIEW row: no id or content is exposed, only that it exists.
 * - `none` covers every other status and an unknown platform/external id pair.
 *
 * `id` and `url` are omitted from the JSON body (not just null) for `pending` and `none`,
 * matching the frontend's discriminated union.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class FilmSubmissionLookupDto(
    val status: String,
    val id: UUID? = null,
    val url: String? = null,
) {
    companion object {
        const val STATUS_PUBLIC = "public"
        const val STATUS_PENDING = "pending"
        const val STATUS_NONE = "none"

        fun activeMedia(id: UUID): FilmSubmissionLookupDto = FilmSubmissionLookupDto(status = STATUS_PUBLIC, id = id, url = "/films/$id")

        fun pendingMedia(): FilmSubmissionLookupDto = FilmSubmissionLookupDto(status = STATUS_PENDING)

        fun noMedia(): FilmSubmissionLookupDto = FilmSubmissionLookupDto(status = STATUS_NONE)
    }
}
