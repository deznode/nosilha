package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.BatchUploadError
import com.nosilha.core.gallery.api.dto.BulkConfirmRequest
import com.nosilha.core.gallery.api.dto.BulkConfirmResponse
import com.nosilha.core.gallery.api.dto.BulkPresignItemResponse
import com.nosilha.core.gallery.api.dto.BulkPresignRequest
import com.nosilha.core.gallery.api.dto.BulkPresignResponse
import com.nosilha.core.gallery.api.dto.OrphanDetectionResponse
import com.nosilha.core.gallery.api.dto.OrphanObjectDto
import com.nosilha.core.gallery.api.dto.R2BucketListResponse
import com.nosilha.core.gallery.api.dto.R2ObjectDto
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Orchestrates R2 admin operations: bucket listing, bulk upload,
 * and orphan detection/linking/deletion.
 *
 * Delegates storage operations to [R2StorageService] and database
 * operations to [GalleryMediaRepository].
 *
 * @see R2StorageService
 * @see GalleryMediaRepository
 */
@Service
class R2AdminService(
    private val r2StorageService: R2StorageService?,
    private val repository: GalleryMediaRepository,
) {
    private fun requireR2(): R2StorageService = requireNotNull(r2StorageService) { "R2 storage is not configured" }

    /**
     * Lists objects in the R2 bucket with optional prefix filtering and pagination.
     *
     * @param prefix Optional key prefix to filter by
     * @param continuationToken Token from previous response for pagination
     * @param maxKeys Maximum number of objects to return (default 100)
     * @return Paginated bucket listing with public URLs
     */
    @Transactional(readOnly = true)
    fun listBucket(
        prefix: String?,
        continuationToken: String?,
        maxKeys: Int = 100,
    ): R2BucketListResponse {
        val r2 = requireR2()
        val result = r2.listObjects(prefix, continuationToken, maxKeys)

        val objects = result.objects.map { obj ->
            R2ObjectDto(
                key = obj.key,
                size = obj.size,
                lastModified = obj.lastModified,
                publicUrl = r2.getPublicUrl(obj.key),
            )
        }

        return R2BucketListResponse(
            objects = objects,
            continuationToken = result.continuationToken,
            isTruncated = result.isTruncated,
        )
    }

    /**
     * Generates batch presigned PUT URLs for direct R2 upload.
     *
     * Admin uploads use 30-minute expiry (vs 10-min for regular users).
     *
     * @param request Batch of files to presign (max 20)
     * @param adminId UUID of the admin performing the operation
     * @return Presigned URLs with storage keys and expiry
     */
    fun generateBulkPresignUrls(
        request: BulkPresignRequest,
        adminId: UUID,
    ): BulkPresignResponse {
        val r2 = requireR2()
        logger.info { "Admin $adminId generating bulk presign for ${request.files.size} files" }

        val presigns = request.files.map { file ->
            val result = r2.generatePresignedPutUrl(
                fileName = file.fileName,
                contentType = file.contentType,
                expiryMinutes = 30,
            )
            BulkPresignItemResponse(
                fileName = file.fileName,
                uploadUrl = result.uploadUrl,
                key = result.key,
                expiresAt = result.expiresAt,
            )
        }

        return BulkPresignResponse(presigns = presigns)
    }

    /**
     * Confirms batch upload by verifying objects exist in R2 and creating
     * [UserUploadedMedia] records with ACTIVE status.
     *
     * Uses batch error collection: failures for individual items don't
     * prevent other items from being processed.
     *
     * @param request Batch of upload confirmations (max 20)
     * @param adminId UUID of the admin performing the operation
     * @return Confirmation with accepted/rejected counts and any errors
     */
    @Transactional
    fun confirmBatchUpload(
        request: BulkConfirmRequest,
        adminId: UUID,
    ): BulkConfirmResponse {
        val r2 = requireR2()
        logger.info { "Admin $adminId confirming batch upload of ${request.uploads.size} files" }

        val errors = mutableListOf<BatchUploadError>()
        val created = mutableListOf<UUID>()

        for (upload in request.uploads) {
            if (!r2.objectExists(upload.key)) {
                errors.add(BatchUploadError(key = upload.key, reason = "Object not found in R2"))
                continue
            }

            val media = UserUploadedMedia().apply {
                title = upload.originalName
                description = upload.description
                category = upload.category
                status = GalleryMediaStatus.ACTIVE
                fileName = upload.originalName
                originalName = upload.originalName
                storageKey = upload.key
                publicUrl = r2.getPublicUrl(upload.key)
                contentType = upload.contentType
                fileSize = upload.fileSize
                uploadedBy = adminId
                source = MediaSource.LOCAL
                reviewedBy = adminId
                reviewedAt = Instant.now()
            }

            val saved = repository.save(media)
            created.add(saved.id!!)
        }

        logger.info { "Batch upload confirmed: ${created.size} accepted, ${errors.size} rejected" }

        return BulkConfirmResponse(
            accepted = created.size,
            rejected = errors.size,
            created = created,
            errors = errors,
        )
    }

    /**
     * Detects orphaned R2 objects that have no corresponding database record.
     *
     * Lists R2 objects and computes set difference against stored storage keys.
     *
     * @param prefix Optional key prefix to filter by
     * @param continuationToken Token from previous response for pagination
     * @param maxKeys Maximum number of R2 objects to scan per page (default 1000)
     * @return Orphan list with scan statistics
     */
    @Transactional(readOnly = true)
    fun detectOrphans(
        prefix: String?,
        continuationToken: String?,
        maxKeys: Int = 1000,
    ): OrphanDetectionResponse {
        val r2 = requireR2()
        val result = r2.listObjects(prefix, continuationToken, maxKeys)
        val dbKeys = repository.findAllStorageKeys().toSet()

        val orphans = result.objects
            .filter { it.key !in dbKeys }
            .map { obj ->
                OrphanObjectDto(
                    key = obj.key,
                    size = obj.size,
                    lastModified = obj.lastModified,
                    publicUrl = r2.getPublicUrl(obj.key),
                )
            }

        logger.info { "Orphan detection: scanned ${result.objects.size}, found ${orphans.size} orphans" }

        return OrphanDetectionResponse(
            orphans = orphans,
            totalScanned = result.objects.size,
            continuationToken = result.continuationToken,
            isTruncated = result.isTruncated,
        )
    }

    /**
     * Creates a [UserUploadedMedia] record for an orphaned R2 object.
     *
     * Safety check: verifies the storage key has no existing DB record.
     * Fetches object metadata from R2 via HeadObject.
     *
     * @param storageKey R2 object key to link
     * @param category Optional media category
     * @param description Optional media description
     * @param adminId UUID of the admin performing the operation
     * @return The created media entity
     * @throws BusinessException if the key is already linked to a DB record
     * @throws ResourceNotFoundException if the object does not exist in R2
     */
    @Transactional
    fun linkOrphan(
        storageKey: String,
        category: String?,
        description: String?,
        adminId: UUID,
    ): UserUploadedMedia {
        val r2 = requireR2()

        val existing = repository.findByStorageKey(storageKey)
        if (existing != null) {
            throw BusinessException("Object $storageKey is already linked to media ${existing.id}")
        }

        val metadata = r2.headObject(storageKey)
            ?: throw ResourceNotFoundException("Object $storageKey does not exist in R2")

        val fileName = storageKey.substringAfterLast('/')

        val media = UserUploadedMedia().apply {
            title = fileName
            this.description = description
            this.category = category
            status = GalleryMediaStatus.ACTIVE
            this.fileName = fileName
            originalName = fileName
            this.storageKey = storageKey
            publicUrl = r2.getPublicUrl(storageKey)
            contentType = metadata.contentType
            fileSize = metadata.contentLength
            uploadedBy = adminId
            source = MediaSource.LOCAL
            reviewedBy = adminId
            reviewedAt = Instant.now()
        }

        val saved = try {
            repository.save(media)
        } catch (ex: DataIntegrityViolationException) {
            throw BusinessException("Object $storageKey is already linked to another media record")
        }
        logger.info { "Admin $adminId linked orphan $storageKey as media ${saved.id}" }
        return saved
    }

    /**
     * Permanently deletes an orphaned R2 object.
     *
     * Safety check: verifies the storage key has no existing DB record
     * before deletion.
     *
     * @param storageKey R2 object key to delete
     * @throws BusinessException if the key is linked to a DB record
     */
    @Transactional
    fun deleteOrphan(storageKey: String) {
        val r2 = requireR2()

        val existing = repository.findByStorageKey(storageKey)
        if (existing != null) {
            throw BusinessException("Object $storageKey is linked to media ${existing.id} — cannot delete")
        }

        r2.deleteObject(storageKey)
        logger.info { "Deleted orphan object from R2: $storageKey" }
    }
}
