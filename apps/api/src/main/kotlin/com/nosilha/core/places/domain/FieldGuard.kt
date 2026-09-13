package com.nosilha.core.places.domain

/**
 * Category guarding and derived completeness for directory entries.
 *
 * Spec 033-archive-redesign, FR-002 and FR-003.
 *
 * <p>Ratings and practical contact fields live on the shared single-table-inheritance
 * base, so by schema a church has a rating and a stretch of coast has opening hours.
 * This file is the single place that decides which category may legitimately carry
 * which field. It belongs here rather than in a template because every surface that
 * renders an entry would otherwise re-inherit the bug.</p>
 *
 * <p><strong>Two distinct rules, deliberately separated.</strong> Conflating them is
 * the mistake this design exists to prevent:</p>
 *
 * <ul>
 *   <li>{@link #supports} — category eligibility. Drives the completeness
 *       <em>denominator</em>. A bay is never marked incomplete for lacking opening
 *       hours, because opening hours are not counted against it at all.</li>
 *   <li>{@link #shows} — display. Eligible <em>or</em> a value already exists. A
 *       record that genuinely holds a phone number renders it whatever its category.</li>
 * </ul>
 *
 * <p>The concrete case that forces the split: {@code casa-eugenio-tavares} is a
 * <strong>Heritage</strong> record carrying a real phone, email, website and opening
 * hours. It must display them. But making Heritage contact-eligible would put those
 * fields in the denominator for every Heritage record, so {@code praca-eugenio-tavares}
 * — a public square — would read as incomplete for lacking a phone number.</p>
 */
enum class PracticalField {
    RATING,
    CONTACT,
    OPENING_HOURS,
    CUISINE,
    AMENITIES,
}

/**
 * Completeness of a directory entry: how many of its applicable fields are documented.
 *
 * Derived on read, never stored — a stored score would be an assertion, and the point
 * of the archive redesign is that counts are computed from what is actually there.
 *
 * @property documented count of applicable fields carrying a value
 * @property total count of applicable fields (the denominator)
 * @property missingFields keys of applicable-but-empty fields, in display order
 */
data class Completeness(
    val documented: Int,
    val total: Int,
    val missingFields: List<String>,
)

private const val CATEGORY_HOTEL = "Hotel"
private const val CATEGORY_RESTAURANT = "Restaurant"

private val RATING_CATEGORIES = setOf(CATEGORY_HOTEL)
private val CONTACT_CATEGORIES = setOf(CATEGORY_HOTEL, CATEGORY_RESTAURANT)
private val OPENING_HOURS_CATEGORIES = setOf(CATEGORY_HOTEL, CATEGORY_RESTAURANT)
private val CUISINE_CATEGORIES = setOf(CATEGORY_RESTAURANT)
private val AMENITIES_CATEGORIES = setOf(CATEGORY_HOTEL)

/**
 * Whether this entry's category is eligible for [field].
 *
 * This drives the completeness denominator. It is intentionally narrow: accommodation
 * and dining only. Heritage, Nature, Beach, Viewpoint, Trail, Church and Port count
 * only description and photograph toward completeness.
 */
fun DirectoryEntry.supports(field: PracticalField): Boolean =
    when (field) {
        PracticalField.RATING -> getCategoryValue() in RATING_CATEGORIES
        PracticalField.CONTACT -> getCategoryValue() in CONTACT_CATEGORIES
        PracticalField.OPENING_HOURS -> getCategoryValue() in OPENING_HOURS_CATEGORIES
        PracticalField.CUISINE -> getCategoryValue() in CUISINE_CATEGORIES
        PracticalField.AMENITIES -> getCategoryValue() in AMENITIES_CATEGORIES
    }

/**
 * Whether [field] should be rendered for this entry: eligible by category, or already
 * carrying a value.
 *
 * [PracticalField.RATING] deliberately has no value-exists escape hatch. A stray
 * rating on a heritage record is data that should not surface — FR-011 requires
 * accommodation be the only surface that renders one.
 */
fun DirectoryEntry.shows(field: PracticalField): Boolean =
    when (field) {
        PracticalField.RATING -> supports(field)
        else -> supports(field) || hasValueFor(field)
    }

private fun DirectoryEntry.hasValueFor(field: PracticalField): Boolean =
    when (field) {
        PracticalField.RATING -> rating != null
        PracticalField.CONTACT ->
            !phoneNumber.isNullOrBlank() || !email.isNullOrBlank() || !website.isNullOrBlank()
        PracticalField.OPENING_HOURS -> !openingHours.isNullOrBlank()
        PracticalField.CUISINE -> !cuisine.isNullOrBlank()
        PracticalField.AMENITIES -> !amenities.isNullOrBlank()
    }

/**
 * Computes how many of this entry's applicable fields are documented.
 *
 * Description and photograph count for every category. Everything else is included
 * only when [supports] says the category is eligible, so the denominator varies by
 * category and a record is never penalised for lacking a field it could not have.
 */
fun DirectoryEntry.completeness(): Completeness {
    val checks = buildList {
        add("description" to description.isNotBlank())
        add("photograph" to !imageUrl.isNullOrBlank())
        if (supports(PracticalField.RATING)) add("rating" to (rating != null))
        if (supports(PracticalField.CONTACT)) {
            add("phoneNumber" to !phoneNumber.isNullOrBlank())
            add("email" to !email.isNullOrBlank())
            add("website" to !website.isNullOrBlank())
        }
        if (supports(PracticalField.OPENING_HOURS)) add("openingHours" to !openingHours.isNullOrBlank())
        if (supports(PracticalField.CUISINE)) add("cuisine" to !cuisine.isNullOrBlank())
        if (supports(PracticalField.AMENITIES)) add("amenities" to !amenities.isNullOrBlank())
    }
    return Completeness(
        documented = checks.count { it.second },
        total = checks.size,
        missingFields = checks.filterNot { it.second }.map { it.first },
    )
}

/** The rating to expose, or null when this entry's category may not carry one. */
fun DirectoryEntry.guardedRating(): Double? = if (shows(PracticalField.RATING)) rating else null

/** The review count to expose, or zero when this entry's category may not carry one. */
fun DirectoryEntry.guardedReviewCount(): Int = if (shows(PracticalField.RATING)) reviewCount else 0

/** The phone number to expose, or null when neither eligible nor already present. */
fun DirectoryEntry.guardedPhoneNumber(): String? = if (shows(PracticalField.CONTACT)) phoneNumber else null

/** The email to expose, or null when neither eligible nor already present. */
fun DirectoryEntry.guardedEmail(): String? = if (shows(PracticalField.CONTACT)) email else null

/** The website to expose, or null when neither eligible nor already present. */
fun DirectoryEntry.guardedWebsite(): String? = if (shows(PracticalField.CONTACT)) website else null
