package com.nosilha.core.gallery.api.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.nosilha.core.gallery.domain.ExternalMedia
import java.util.UUID

/**
 * Result of a duplicate check for an external film submission, by platform and external id
 * (spec 039). Matches `GET /api/v1/gallery/submissions/lookup`.
 *
 * - `public` means an ACTIVE row — safe to link to, so `id` and `url` are included, with
 *   whichever of title, place and date the record holds, to name the film to the submitter.
 * - `pending` means a PENDING_REVIEW row: no id or content is exposed, only that it exists.
 * - `none` covers every other status and an unknown platform/external id pair.
 *
 * Every field but `status` is omitted from the JSON body (not just null) for `pending` and
 * `none`, matching the frontend's discriminated union.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class FilmSubmissionLookupDto(
    val status: String,
    val id: UUID? = null,
    val url: String? = null,
    /** The curated title, else the host's. */
    val title: String? = null,
    /** The settlement's name, else the record's own location text. */
    val place: String? = null,
    val approximateDate: String? = null,
) {
    companion object {
        const val STATUS_PUBLIC = "public"
        const val STATUS_PENDING = "pending"
        const val STATUS_NONE = "none"

        fun activeMedia(
            media: ExternalMedia,
            townName: String?,
        ): FilmSubmissionLookupDto =
            FilmSubmissionLookupDto(
                status = STATUS_PUBLIC,
                id = media.id,
                url = "/films/${media.id}",
                title = media.displayTitle.orNullIfBlank() ?: media.title.orNullIfBlank(),
                place = townName ?: media.locationName.orNullIfBlank(),
                approximateDate = media.approximateDate.orNullIfBlank(),
            )

        fun pendingMedia(): FilmSubmissionLookupDto = FilmSubmissionLookupDto(status = STATUS_PENDING)

        fun noMedia(): FilmSubmissionLookupDto = FilmSubmissionLookupDto(status = STATUS_NONE)
    }
}

private fun String?.orNullIfBlank(): String? = this?.trim()?.ifBlank { null }
