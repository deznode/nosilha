package com.nosilha.core.places.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

/**
 * Entity representing a town or village on Brava Island.
 *
 * Towns are geographic containers that contain directory entries (businesses, landmarks, etc.).
 * This entity follows the geographic/administrative data pattern, separate from the business
 * directory entries pattern used by restaurants, hotels, etc.
 *
 * Unlike DirectoryEntry which represents visitable businesses/attractions, Town represents
 * the administrative and geographic information about settlements on the island.
 */
@Entity
@Table(name = "towns")
class Town {
    @Id
    @GeneratedValue
    var id: UUID? = null

    @Column(nullable = false)
    lateinit var name: String

    @Column(unique = true, nullable = false)
    lateinit var slug: String

    @Column(length = 2048)
    lateinit var description: String

    @Column(nullable = false)
    var latitude: Double = 0.0

    @Column(nullable = false)
    var longitude: Double = 0.0

    // Town-specific administrative and geographic fields
    var population: String? = null
    var elevation: String? = null
    var founded: String? = null

    /**
     * JSON array of highlights/notable features for this town.
     * Stored as TEXT to accommodate varying numbers of highlights.
     */
    @Column(columnDefinition = "TEXT")
    var highlights: String? = null

    /**
     * Primary hero image URL for the town's main display.
     */
    var heroImage: String? = null

    /**
     * JSON array of gallery image URLs for the town.
     * Stored as TEXT to accommodate varying numbers of images.
     */
    @Column(columnDefinition = "TEXT")
    var gallery: String? = null

    // Timestamp fields
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    /**
     * JPA lifecycle callback to set createdAt timestamp on entity creation.
     */
    @PrePersist
    private fun onCreate() {
        val now = LocalDateTime.now()
        createdAt = now
        updatedAt = now
    }

    /**
     * JPA lifecycle callback to update updatedAt timestamp on entity modification.
     */
    @PreUpdate
    private fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Town

        // An entity is defined by its ID. If null, it's only equal to itself.
        return id != null && id == other.id
    }

    override fun hashCode(): Int {
        // For transient entities (id is null), return a constant.
        // Otherwise, use the hashcode of the unique ID.
        return id?.hashCode() ?: 31
    }

    override fun toString(): String = "Town(id=$id, name='$name', slug='$slug')"
}
