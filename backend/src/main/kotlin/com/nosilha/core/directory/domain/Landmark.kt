package com.nosilha.core.directory.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Represents a historical or cultural landmark entry in the directory.
 *
 * <p>This is a concrete implementation of DirectoryEntry, identified by the
 * discriminator value "Landmark" in the `category` column. It inherits all
 * common properties.</p>
 */
@Entity
@DiscriminatorValue("Landmark")
class Landmark : DirectoryEntry()
