package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import java.time.LocalDateTime
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

    @get:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    abstract val createdAt: LocalDateTime

    @get:JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    abstract val updatedAt: LocalDateTime

    abstract val category: String
}

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
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime,
    val details: RestaurantDetailsDto,
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
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime,
    val details: HotelDetailsDto,
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
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime,
    val details: DetailsDto? = null,
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
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime,
    val details: DetailsDto? = null,
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
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime,
    val details: DetailsDto? = null,
    override val category: String = "Nature",
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
