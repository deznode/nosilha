package com.nosilha.core.places.domain

import com.nosilha.core.gallery.api.HeroMediaRef
import com.nosilha.core.shared.api.BeachDto
import com.nosilha.core.shared.api.ChurchDto
import com.nosilha.core.shared.api.CoincidentRefDto
import com.nosilha.core.shared.api.CompletenessDto
import com.nosilha.core.shared.api.ContentActionSettingsDto
import com.nosilha.core.shared.api.DirectoryEntryDto
import com.nosilha.core.shared.api.HeritageDetailsDto
import com.nosilha.core.shared.api.HeritageDto
import com.nosilha.core.shared.api.HeroImageDto
import com.nosilha.core.shared.api.HotelDetailsDto
import com.nosilha.core.shared.api.HotelDto
import com.nosilha.core.shared.api.NatureDto
import com.nosilha.core.shared.api.PortDto
import com.nosilha.core.shared.api.RestaurantDetailsDto
import com.nosilha.core.shared.api.RestaurantDto
import com.nosilha.core.shared.api.TownDto
import com.nosilha.core.shared.api.TrailDto
import com.nosilha.core.shared.api.ViewpointDto
import io.github.oshai.kotlinlogging.KotlinLogging
import tools.jackson.module.kotlin.jacksonObjectMapper
import tools.jackson.module.kotlin.readValue

private val directoryMetadataMapper = jacksonObjectMapper()
private val logger = KotlinLogging.logger {}

/**
 * Maps a DirectoryEntry JPA entity to its corresponding public-facing DTO.
 *
 * This extension function handles the polymorphic nature of the DirectoryEntry hierarchy,
 * ensuring that each subclass (Restaurant, Hotel, etc.) is converted to the correct
 * DTO representation (RestaurantDto, HotelDto, etc.).
 *
 * @receiver The DirectoryEntry entity instance to map.
 * @param hero the entry's resolved hero image, or null when it has none. Callers resolve heroes
 *   for the whole set they map, so mapping never queries (spec 034 FR-023).
 * @param coincidentWith another record at byte-identical coordinates, when one is known.
 *   Supplied only on the detail path — list views do not pay for the lookup. See spec 033 FR-007.
 * @return The corresponding DirectoryEntryDto for the entity.
 * @throws IllegalStateException if the entity's ID is null, as DTOs are meant for persisted entities.
 */
fun DirectoryEntry.toDto(
    hero: HeroMediaRef?,
    coincidentWith: CoincidentRefDto? = null,
): DirectoryEntryDto {
    val entityId = this.id ?: throw IllegalStateException("Cannot map an entity with a null ID to a DTO.")
    val tagList = this.parseTags()
    val contentActionSettings = this.parseContentActions()

    return when (this) {
        is Restaurant -> RestaurantDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
            details = RestaurantDetailsDto(
                phoneNumber = phoneNumber ?: "",
                openingHours = openingHours ?: "",
                cuisine = cuisine.parseCommaSeparated(),
            ),
        )

        is Hotel -> HotelDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
            details = HotelDetailsDto(amenities = amenities.parseCommaSeparated()),
        )

        is Beach -> BeachDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
        )

        is Heritage -> HeritageDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
            details = toHeritageDetails(),
        )

        is Nature -> NatureDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
        )

        is Viewpoint -> ViewpointDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
        )

        is Trail -> TrailDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
        )

        is Church -> ChurchDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
            details = toHeritageDetails(),
        )

        is Port -> PortDto(
            id = entityId,
            name = name,
            slug = slug,
            description = description,
            tags = tagList,
            contentActions = contentActionSettings,
            town = town,
            latitude = latitude,
            longitude = longitude,
            imageUrl = hero?.url,
            rating = guardedRating(),
            reviewCount = guardedReviewCount(),
            phoneNumber = guardedPhoneNumber(),
            email = guardedEmail(),
            website = guardedWebsite(),
            createdAt = createdAt,
            updatedAt = updatedAt,
            townId = townId,
            completeness = completeness(hero?.toHeroFacts()).toDto(),
            coincidentWith = coincidentWith,
            heroImage = hero?.toHeroImageDto(),
        )

        else -> throw IllegalStateException("Unsupported or unknown DirectoryEntry type: ${this::class.simpleName}")
    }
}

/** What completeness needs from a resolved hero: its recorded credit. */
private fun HeroMediaRef.toHeroFacts(): HeroFacts = HeroFacts(photographerCredit = photographerCredit)

/** Maps a resolved hero onto the credit-carrying DTO the place record reads. */
fun HeroMediaRef.toHeroImageDto(): HeroImageDto =
    HeroImageDto(mediaId = mediaId, url = url, photographerCredit = photographerCredit, archiveSource = archiveSource)

/** Heritage and church details, each field exposed only where the guard shows it. */
private fun DirectoryEntry.toHeritageDetails(): HeritageDetailsDto =
    HeritageDetailsDto(
        established = established.takeIf { shows(PracticalField.ESTABLISHED) },
        conditionStatus = conditionStatus.takeIf { shows(PracticalField.CONDITION_STATUS) },
        festival = festival.takeIf { shows(PracticalField.FESTIVAL) },
        architect = architect.takeIf { shows(PracticalField.ARCHITECT) },
    )

/**
 * Parses a comma-separated string into a trimmed list, filtering empty entries.
 */
private fun String?.parseCommaSeparated(): List<String> = this?.split(',')?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

private fun DirectoryEntry.parseTags(): List<String> = this.tags.parseCommaSeparated()

private fun DirectoryEntry.parseContentActions(): ContentActionSettingsDto? {
    val config = this.contentActions ?: return null
    return try {
        directoryMetadataMapper.readValue<ContentActionSettingsDto>(config)
    } catch (ex: tools.jackson.core.JacksonException) {
        logger.warn { "Failed to parse content_actions metadata for entry ${this.id ?: "unsaved"}: ${ex.message}" }
        null
    }
}

/**
 * Maps a Town JPA entity to its corresponding public-facing DTO.
 *
 * This extension function parses the stored highlights JSON array into a List<String>.
 *
 * @receiver The Town entity instance to map.
 * @return The corresponding TownDto for the entity.
 * @throws IllegalStateException if the entity's ID is null, as DTOs are meant for persisted entities.
 */
fun Town.toDto(): TownDto {
    val entityId = this.id ?: throw IllegalStateException("Cannot map an entity with a null ID to a DTO.")

    return TownDto(
        id = entityId,
        name = this.name,
        slug = this.slug,
        description = this.description,
        latitude = this.latitude,
        longitude = this.longitude,
        population = this.population,
        elevation = this.elevation,
        founded = this.founded,
        highlights = parseJsonList(this.highlights, "highlights", this.name),
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
}

/**
 * Parses a JSON string containing a list of strings.
 * Returns empty list if input is null or parsing fails.
 */
private fun parseJsonList(
    json: String?,
    fieldName: String,
    entityName: String,
): List<String> {
    if (json == null) return emptyList()
    return try {
        directoryMetadataMapper.readValue<List<String>>(json)
    } catch (e: tools.jackson.core.JacksonException) {
        logger.warn { "Failed to parse $fieldName JSON for town $entityName: ${e.message}" }
        emptyList()
    }
}

/**
 * Returns the category value for this DirectoryEntry using polymorphic type checking.
 *
 * This approach is preferred over accessing the discriminator field directly as it:
 * - Avoids lateinit initialization issues with the discriminator column
 * - Leverages Kotlin's polymorphic when expressions for type safety
 * - Decouples business logic from database schema details
 * - Provides consistent behavior regardless of entity state (transient vs persisted)
 *
 * @receiver The DirectoryEntry instance to get the category value for.
 * @return The category string corresponding to the entity's runtime type.
 * @throws IllegalStateException if the entity type is not a known DirectoryEntry subclass.
 */
fun DirectoryEntry.getCategoryValue(): String =
    when (this) {
        is Restaurant -> "Restaurant"
        is Hotel -> "Hotel"
        is Beach -> "Beach"
        is Heritage -> "Heritage"
        is Nature -> "Nature"
        is Viewpoint -> "Viewpoint"
        is Trail -> "Trail"
        is Church -> "Church"
        is Port -> "Port"
        else -> throw IllegalStateException("Unknown DirectoryEntry type: ${this::class.simpleName}")
    }

/** Maps the derived completeness value onto its DTO. */
fun Completeness.toDto(): CompletenessDto = CompletenessDto(documented = documented, total = total, missingFields = missingFields)

/** Maps an entry to a lightweight reference for the coincident-coordinates note. */
fun DirectoryEntry.toCoincidentRef(): CoincidentRefDto =
    CoincidentRefDto(
        id = this.id ?: throw IllegalStateException("Cannot reference an entity with a null ID."),
        name = name,
        slug = slug,
        category = getCategoryValue(),
    )
