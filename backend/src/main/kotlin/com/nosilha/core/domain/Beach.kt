package com.nosilha.core.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Represents a Beach entry in the directory.
 *
 * This is a concrete implementation of DirectoryEntry, identified by the
 * discriminator value "Beach" in the `category` column. It inherits all
 * common properties. Subclass-specific fields like `cuisine` or `amenities`
 * would be null for instances of this type.
 */
@Entity
@DiscriminatorValue("Beach")
class Beach : DirectoryEntry()
