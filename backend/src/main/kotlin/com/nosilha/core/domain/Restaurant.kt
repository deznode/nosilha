package com.nosilha.core.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Represents a Restaurant entry in the directory.
 *
 * This is a concrete implementation of DirectoryEntry, identified by the
 * discriminator value "Restaurant" in the `category` column. It inherits
 * all common properties and can utilize fields like `phoneNumber`, `openingHours`,
 * and `cuisine`.
 */
@Entity
@DiscriminatorValue("Restaurant")
class Restaurant : DirectoryEntry()
