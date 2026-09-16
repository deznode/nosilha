package com.nosilha.core.shared.api

/**
 * Heritage and church details for the place record (spec 034, FR-016).
 *
 * Free text as recorded. Null means not recorded, and the place record asks for it.
 * Built only in the places module's `Mapper.kt`, behind `FieldGuard`.
 *
 * @param established when it was built or founded, e.g. "c. 1826"
 * @param conditionStatus its present condition, e.g. "under reconstruction since 2023"
 * @param festival its festival, e.g. "second weekend of August"
 * @param architect who built it
 * @param openingHours when a visitor can go in, e.g. "Mon-Fri 08:00-13:00". Heritage and
 *   churches are opening-hours eligible in [FieldGuard], so the field grid counts it —
 *   and a record that records it, like `casa-eugenio-tavares`, must be able to show it
 *   rather than asking a question it already holds the answer to (spec 034 FR-013).
 */
data class HeritageDetailsDto(
    val established: String?,
    val conditionStatus: String?,
    val festival: String?,
    val architect: String?,
    val openingHours: String?,
) : DetailsDto
