package com.nosilha.core.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import java.util.UUID

/**
 * The base DTO for any entry in the directory.
 *
 * This abstract class uses Jackson's polymorphism annotations to ensure that when
 * serialized to JSON, a `category` field is included, which determines the
 * concrete subtype. This allows clients to easily deserialize the object into
 * a discriminated union type.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "category")
@JsonSubTypes(
  JsonSubTypes.Type(value = RestaurantDto::class, name = "Restaurant"),
  JsonSubTypes.Type(value = HotelDto::class, name = "Hotel"),
  JsonSubTypes.Type(value = BeachDto::class, name = "Beach"),
  JsonSubTypes.Type(value = LandmarkDto::class, name = "Landmark")
)
abstract class DirectoryEntryDto {
  abstract val id: UUID
  abstract val name: String
  abstract val description: String
  abstract val town: String
  abstract val imageUrl: String?
  abstract val rating: Double?
  abstract val reviewCount: Int
}

/**
 * DTO for a Restaurant entry. Includes restaurant-specific details.
 */
@JsonTypeName("Restaurant")
data class RestaurantDto(
  override val id: UUID,
  override val name: String,
  override val description: String,
  override val town: String,
  override val imageUrl: String?,
  override val rating: Double?,
  override val reviewCount: Int,
  val details: RestaurantDetailsDto
) : DirectoryEntryDto()

/**
 * DTO for a Hotel entry. Includes hotel-specific details.
 */
@JsonTypeName("Hotel")
data class HotelDto(
  override val id: UUID,
  override val name: String,
  override val description: String,
  override val town: String,
  override val imageUrl: String?,
  override val rating: Double?,
  override val reviewCount: Int,
  val details: HotelDetailsDto
) : DirectoryEntryDto()

/**
 * DTO for a Beach entry. Does not contain any specific details.
 */
@JsonTypeName("Beach")
data class BeachDto(
  override val id: UUID,
  override val name: String,
  override val description: String,
  override val town: String,
  override val imageUrl: String?,
  override val rating: Double?,
  override val reviewCount: Int,
  val details: DetailsDto? = null
) : DirectoryEntryDto()

/**
 * DTO for a Landmark entry. Does not contain any specific details.
 */
@JsonTypeName("Landmark")
data class LandmarkDto(
  override val id: UUID,
  override val name: String,
  override val description: String,
  override val town: String,
  override val imageUrl: String?,
  override val rating: Double?,
  override val reviewCount: Int,
  val details: DetailsDto? = null
) : DirectoryEntryDto()