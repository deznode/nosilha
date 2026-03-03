package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Heritage site - historical and cultural landmarks
 *
 * Examples on Brava Island: Churches, monuments, colonial buildings,
 * Casa Eugénio Tavares, historical buildings
 */
@Entity
@DiscriminatorValue("Heritage")
class Heritage : DirectoryEntry()
