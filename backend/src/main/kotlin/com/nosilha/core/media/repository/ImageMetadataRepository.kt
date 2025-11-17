package com.nosilha.core.media.repository

import com.google.cloud.spring.data.firestore.FirestoreReactiveRepository
import com.nosilha.core.media.domain.ImageMetadata
import org.springframework.stereotype.Repository

/**
 * Spring Data repository for managing ImageMetadata documents in Google Cloud Firestore.
 *
 * This interface extends FirestoreReactiveRepository, which provides reactive,
 * non-blocking methods for CRUD operations (e.g., returning Mono and Flux types).
 */
@Repository
interface ImageMetadataRepository : FirestoreReactiveRepository<ImageMetadata>
