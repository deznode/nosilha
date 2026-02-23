package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Town point of interest - settlements and villages as directory entries.
 *
 * Named TownPoi to avoid collision with the geographic Town entity
 * which represents administrative town data in the towns table.
 *
 * Examples on Brava Island: Nova Sintra, Furna, Cachaço
 */
@Entity
@DiscriminatorValue("Town")
class TownPoi : DirectoryEntry()
