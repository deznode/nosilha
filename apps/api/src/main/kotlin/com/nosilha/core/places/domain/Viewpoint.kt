package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Viewpoint - scenic overlooks and miradouros
 *
 * Examples on Brava Island: Miradouro de Nova Sintra,
 * Miradouro de Santa Barbara
 */
@Entity
@DiscriminatorValue("Viewpoint")
class Viewpoint : DirectoryEntry()
