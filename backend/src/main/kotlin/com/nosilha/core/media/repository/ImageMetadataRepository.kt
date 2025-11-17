package com.nosilha.core.media.repository

import com.google.cloud.spring.data.firestore.FirestoreReactiveRepository
import com.nosilha.core.media.domain.ImageMetadata
import org.springframework.stereotype.Repository

/**
 * Spring Data repository for managing ImageMetadata documents in Google Cloud Firestore.
 *
 * This interface extends FirestoreReactiveRepository, which provides reactive,
 * non-blocking methods for CRUD operations (e.g., returning Mono and Flux types).
 *
 * This repository is only enabled when gcp.enabled=true (default). In test environments,
 * set gcp.enabled=false to prevent this repository from loading and requiring Firestore infrastructure.
 */
@Repository
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    prefix = "gcp",
    name = ["enabled"],
    havingValue = "true",
    matchIfMissing = true,
)
interface ImageMetadataRepository : FirestoreReactiveRepository<ImageMetadata>
