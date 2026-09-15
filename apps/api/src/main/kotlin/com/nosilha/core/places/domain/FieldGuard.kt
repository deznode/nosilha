package com.nosilha.core.places.domain

/**
 * Category guarding and derived completeness for directory entries.
 *
 * Spec 033-archive-redesign, FR-002 and FR-003; spec 034-media-map-redesign, FR-016.
 *
 * <p>Ratings, practical contact fields and heritage fields live on the shared
 * single-table-inheritance base, so by schema a church has a rating and a stretch of
 * coast has an architect. This file is the single place that decides which category may
 * legitimately carry which field. It belongs here rather than in a template because
 * every surface that renders an entry would otherwise re-inherit the bug.</p>
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
    ESTABLISHED,
    CONDITION_STATUS,
    FESTIVAL,
    ARCHITECT,
}

/**
 * What completeness needs to know about an entry's hero image, resolved by the caller.
 *
 * A null [HeroFacts] means the entry has no hero. Heroes move into the gallery module
 * (spec 034 Wave 3), where places cannot read them from its own row, so completeness
 * takes the fact as an argument rather than reading a column.
 *
 * @property photographerCredit the hero's recorded credit. Null, blank and "not known"
 *   all leave the photographer not recorded: "not known" is an honest answer, not a name.
 */
data class HeroFacts(
    val photographerCredit: String?,
)

/**
 * Completeness of a directory entry: how many rows of its field grid are recorded.
 *
 * Derived on read, never stored — a stored score would be an assertion, and the point
 * of the archive redesign is that counts are computed from what is actually there.
 *
 * @property documented count of grid rows carrying a value
 * @property total count of grid rows (the denominator, one bar segment each)
 * @property missingFields keys of rows not recorded, in grid order
 */
data class Completeness(
    val documented: Int,
    val total: Int,
    val missingFields: List<String>,
)

private const val CATEGORY_HOTEL = "Hotel"
private const val CATEGORY_RESTAURANT = "Restaurant"
private const val CATEGORY_HERITAGE = "Heritage"
private const val CATEGORY_CHURCH = "Church"
private const val CREDIT_NOT_KNOWN = "not known"

private val RATING_CATEGORIES = setOf(CATEGORY_HOTEL)
private val CONTACT_CATEGORIES = setOf(CATEGORY_HOTEL, CATEGORY_RESTAURANT)
private val OPENING_HOURS_CATEGORIES = setOf(CATEGORY_HOTEL, CATEGORY_RESTAURANT, CATEGORY_HERITAGE, CATEGORY_CHURCH)
private val CUISINE_CATEGORIES = setOf(CATEGORY_RESTAURANT)
private val AMENITIES_CATEGORIES = setOf(CATEGORY_HOTEL)
private val HERITAGE_CATEGORIES = setOf(CATEGORY_HERITAGE, CATEGORY_CHURCH)

/**
 * Whether this entry's category is eligible for [field].
 *
 * This drives the completeness denominator. Accommodation and dining carry the practical
 * fields; heritage and churches carry the heritage fields and opening hours; Nature,
 * Beach, Viewpoint, Trail and Port carry none of them.
 */
fun DirectoryEntry.supports(field: PracticalField): Boolean =
    when (field) {
        PracticalField.RATING -> getCategoryValue() in RATING_CATEGORIES
        PracticalField.CONTACT -> getCategoryValue() in CONTACT_CATEGORIES
        PracticalField.OPENING_HOURS -> getCategoryValue() in OPENING_HOURS_CATEGORIES
        PracticalField.CUISINE -> getCategoryValue() in CUISINE_CATEGORIES
        PracticalField.AMENITIES -> getCategoryValue() in AMENITIES_CATEGORIES
        PracticalField.ESTABLISHED,
        PracticalField.CONDITION_STATUS,
        PracticalField.FESTIVAL,
        PracticalField.ARCHITECT,
        -> getCategoryValue() in HERITAGE_CATEGORIES
    }

/**
 * Whether [field] should be rendered for this entry: eligible by category, or already
 * carrying a value.
 *
 * [PracticalField.RATING] deliberately has no value-exists escape hatch. A stray
 * rating on a heritage record is data that should not surface — accommodation is the
 * only surface that renders one.
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
        PracticalField.ESTABLISHED -> !established.isNullOrBlank()
        PracticalField.CONDITION_STATUS -> !conditionStatus.isNullOrBlank()
        PracticalField.FESTIVAL -> !festival.isNullOrBlank()
        PracticalField.ARCHITECT -> !architect.isNullOrBlank()
    }

private fun HeroFacts.namesPhotographer(): Boolean {
    val credit = photographerCredit?.trim().orEmpty()
    return credit.isNotEmpty() && !credit.equals(CREDIT_NOT_KNOWN, ignoreCase = true)
}

/**
 * Computes how many rows of this entry's field grid are recorded.
 *
 * <p><strong>The denominator is the place record's field grid</strong>, so the "N of M
 * fields recorded" sentence and the segmented bar count the same rows the page renders
 * (spec 034 FR-013). Which rows exist:</p>
 *
 * <ul>
 *   <li>Settlement, Category and Coordinates — structural, recorded for any placed
 *       record. Coordinates of exactly 0,0 are the unplaced-submission default and
 *       count as not recorded.</li>
 *   <li>The category's eligible fields, per [supports].</li>
 *   <li>Photographer — only when [hero] is non-null, from its credit.</li>
 * </ul>
 *
 * <p>Rows follow the prototype's heritage grid — Settlement, Category, Established,
 * Coordinates, Status, Festival, Photographer, Opening hours, Architect — skipping any the
 * category lacks, then Rating, Phone, Email, Website, Cuisine and Amenities for
 * accommodation and dining. [Completeness.missingFields] keeps that order, so the place
 * record can render from it.</p>
 *
 * <p>Description and the photograph itself are not rows: the description is the body of
 * the page and the photograph heads it, and whether a record has one is the documentation
 * status, not a field. A heritage record with established, status and festival recorded
 * and a hero without a named photographer reads six of nine, as in the prototype.</p>
 *
 * @param hero the entry's resolved hero image, or null when it has none
 */
fun DirectoryEntry.completeness(hero: HeroFacts?): Completeness {
    val checks = buildList {
        add("settlement" to town.isNotBlank())
        add("category" to true)
        if (supports(PracticalField.ESTABLISHED)) add("established" to hasValueFor(PracticalField.ESTABLISHED))
        add("coordinates" to !(latitude == 0.0 && longitude == 0.0))
        if (supports(PracticalField.CONDITION_STATUS)) {
            add("conditionStatus" to hasValueFor(PracticalField.CONDITION_STATUS))
        }
        if (supports(PracticalField.FESTIVAL)) add("festival" to hasValueFor(PracticalField.FESTIVAL))
        if (hero != null) add("photographer" to hero.namesPhotographer())
        if (supports(PracticalField.OPENING_HOURS)) add("openingHours" to hasValueFor(PracticalField.OPENING_HOURS))
        if (supports(PracticalField.ARCHITECT)) add("architect" to hasValueFor(PracticalField.ARCHITECT))
        if (supports(PracticalField.RATING)) add("rating" to (rating != null))
        if (supports(PracticalField.CONTACT)) {
            add("phoneNumber" to !phoneNumber.isNullOrBlank())
            add("email" to !email.isNullOrBlank())
            add("website" to !website.isNullOrBlank())
        }
        if (supports(PracticalField.CUISINE)) add("cuisine" to hasValueFor(PracticalField.CUISINE))
        if (supports(PracticalField.AMENITIES)) add("amenities" to hasValueFor(PracticalField.AMENITIES))
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
