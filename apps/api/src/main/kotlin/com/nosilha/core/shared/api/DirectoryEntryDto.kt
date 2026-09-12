package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import java.time.Instant
import java.util.*

/**
 * The base DTO for any entry in the directory.
 *
 * This abstract class uses Jackson's polymorphism annotations to ensure that when
 * serialized to JSON, a `category` field is included, which determines the
 * concrete subtype. This allows clients to easily deserialize the object into
 * a discriminated union type.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "category", visible = true)
@JsonSubTypes(
    JsonSubTypes.Type(value = RestaurantDto::class, name = "Restaurant"),
    JsonSubTypes.Type(value = HotelDto::class, name = "Hotel"),
    JsonSubTypes.Type(value = BeachDto::class, name = "Beach"),
    JsonSubTypes.Type(value = HeritageDto::class, name = "Heritage"),
    JsonSubTypes.Type(value = NatureDto::class, name = "Nature"),
    JsonSubTypes.Type(value = ViewpointDto::class, name = "Viewpoint"),
    JsonSubTypes.Type(value = TrailDto::class, name = "Trail"),
    JsonSubTypes.Type(value = ChurchDto::class, name = "Church"),
    JsonSubTypes.Type(value = PortDto::class, name = "Port"),
)
abstract class DirectoryEntryDto {
    abstract val id: UUID
    abstract val name: String
    abstract val slug: String
    abstract val description: String
    abstract val tags: List<String>
    abstract val contentActions: ContentActionSettingsDto?
    abstract val town: String
    abstract val latitude: Double
    abstract val longitude: Double
    abstract val imageUrl: String?
    abstract val rating: Double?
    abstract val reviewCount: Int

    // Contact information (common across all entry types)
    abstract val phoneNumber: String?
    abstract val email: String?
    abstract val website: String?

    abstract val createdAt: Instant

    abstract val updatedAt: Instant

    abstract val category: String

    /**
     * Canonical settlement reference, or null where the legacy free-text [town] has
     * not yet resolved to a `towns` row. See spec 033 FR-001.
     */
    abstract val townId: UUID?

    /**
     * How much of this record is documented, computed from the fields its category
     * can legitimately carry. See spec 033 FR-003.
     */
    abstract val completeness: CompletenessDto

    /**
     * Another record at byte-identical coordinates, when one exists. Surfaced so the
     * duplication is stated rather than hidden. See spec 033 FR-007.
     */
    abstract val coincidentWith: CoincidentRefDto?
}

/**
 * Documented-field count for a directory entry.
 *
 * Both numerator and denominator are exposed so the UI can render "N of M fields
 * documented" and a progress bar without recomputing anything. [missingFields] names
 * the applicable-but-empty fields, so the frontend never re-implements the category
 * guard — it looks each key up in a question table.
 */
data class CompletenessDto(
    val documented: Int,
    val total: Int,
    val missingFields: List<String> = emptyList(),
)

/** A reference to another record sharing this one's exact coordinates. */
data class CoincidentRefDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val category: String,
)

/**
 * DTO for a Restaurant entry. Includes restaurant-specific details.
 */
@JsonTypeName("Restaurant")
data class RestaurantDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: RestaurantDetailsDto,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Restaurant",
) : DirectoryEntryDto()

/**
 * DTO for a Hotel entry. Includes hotel-specific details.
 */
@JsonTypeName("Hotel")
data class HotelDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: HotelDetailsDto,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Hotel",
) : DirectoryEntryDto()

/**
 * DTO for a Beach entry. Does not contain any specific details.
 */
@JsonTypeName("Beach")
data class BeachDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Beach",
) : DirectoryEntryDto()

/**
 * DTO for a Heritage entry. Does not contain any specific details.
 */
@JsonTypeName("Heritage")
data class HeritageDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Heritage",
) : DirectoryEntryDto()

/**
 * DTO for a Nature entry. Does not contain any specific details.
 */
@JsonTypeName("Nature")
data class NatureDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Nature",
) : DirectoryEntryDto()

/**
 * DTO for a Viewpoint entry. Does not contain any specific details.
 */
@JsonTypeName("Viewpoint")
data class ViewpointDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Viewpoint",
) : DirectoryEntryDto()

/**
 * DTO for a Trail entry. Does not contain any specific details.
 */
@JsonTypeName("Trail")
data class TrailDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Trail",
) : DirectoryEntryDto()

/**
 * DTO for a Church entry. Does not contain any specific details.
 */
@JsonTypeName("Church")
data class ChurchDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Church",
) : DirectoryEntryDto()

/**
 * DTO for a Port entry. Does not contain any specific details.
 */
@JsonTypeName("Port")
data class PortDto(
    override val id: UUID,
    override val name: String,
    override val slug: String,
    override val description: String,
    override val tags: List<String> = emptyList(),
    override val contentActions: ContentActionSettingsDto? = null,
    override val town: String,
    override val latitude: Double,
    override val longitude: Double,
    override val imageUrl: String?,
    override val rating: Double?,
    override val reviewCount: Int,
    override val phoneNumber: String? = null,
    override val email: String? = null,
    override val website: String? = null,
    override val createdAt: Instant,
    override val updatedAt: Instant,
    val details: DetailsDto? = null,
    override val townId: UUID? = null,
    override val completeness: CompletenessDto = CompletenessDto(0, 0),
    override val coincidentWith: CoincidentRefDto? = null,
    override val category: String = "Port",
) : DirectoryEntryDto()

/**
 * Configuration for overriding the default Content Action Toolbar behavior.
 *
 * @property order List describing the desired action ordering.
 * @property disabled Set of actions to hide for a specific page.
 */
data class ContentActionSettingsDto(
    val order: List<ContentActionTypeDto> = ContentActionTypeDto.defaultOrder(),
    val disabled: List<ContentActionTypeDto> = emptyList(),
)

enum class ContentActionTypeDto {
    SHARE,
    COPY_LINK,
    PRINT,
    REACTIONS,
    SUGGEST;

    companion object {
        fun defaultOrder(): List<ContentActionTypeDto> = listOf(SHARE, COPY_LINK, PRINT, REACTIONS, SUGGEST)
    }
}
