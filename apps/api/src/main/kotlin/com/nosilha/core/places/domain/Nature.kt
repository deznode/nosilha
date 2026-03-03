package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Natural site - viewpoints, volcanic features, trails
 *
 * Examples on Brava Island: Miradouros (viewpoints), volcanic craters,
 * hiking trails, natural springs
 */
@Entity
@DiscriminatorValue("Nature")
class Nature : DirectoryEntry()
