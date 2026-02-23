package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Trail - hiking paths and walking routes
 *
 * Examples on Brava Island: Fontainhas trail,
 * Nova Sintra to Fajã d'Água trail
 */
@Entity
@DiscriminatorValue("Trail")
class Trail : DirectoryEntry()
