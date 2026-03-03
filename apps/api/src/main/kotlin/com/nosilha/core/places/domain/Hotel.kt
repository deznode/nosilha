package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Represents a Hotel or accommodation entry in the directory.
 *
 * <p>This is a concrete implementation of DirectoryEntry, identified by the
 * discriminator value "Hotel" in the `category` column. It inherits all
 * common properties and can utilize fields like `phoneNumber` and `amenities`.</p>
 */
@Entity
@DiscriminatorValue("Hotel")
class Hotel : DirectoryEntry()
