package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Represents a Town entry in the directory.
 *
 * <p>This is a concrete implementation of DirectoryEntry, identified by the
 * discriminator value "Town" in the `category` column. It inherits all
 * common properties. Named TownEntry to avoid collision with the separate
 * Town entity (geographic/administrative data in the `towns` table).</p>
 */
@Entity
@DiscriminatorValue("Town")
class TownEntry : DirectoryEntry()
