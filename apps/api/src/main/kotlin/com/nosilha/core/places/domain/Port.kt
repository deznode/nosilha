package com.nosilha.core.places.domain

import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity

/**
 * Port - harbors and maritime infrastructure
 *
 * Examples on Brava Island: Porto de Furna
 */
@Entity
@DiscriminatorValue("Port")
class Port : DirectoryEntry()
