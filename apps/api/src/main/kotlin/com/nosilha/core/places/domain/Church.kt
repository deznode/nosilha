package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Church - religious buildings and places of worship
 *
 * Examples on Brava Island: Igreja de São João Baptista,
 * Igreja de Nossa Senhora do Monte
 */
@Entity
@DiscriminatorValue("Church")
class Church : DirectoryEntry()
