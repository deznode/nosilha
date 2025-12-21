package com.nosilha.core.media.domain

import com.nosilha.core.media.repository.MediaRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Service for handling local filesystem-based media storage.
 *
 * <p>This service manages file uploads to the local filesystem, storing metadata
 * in PostgreSQL via the MediaRepository. It's designed for development use,
 * with production cloud storage integration deferred.</p>
 *
 * <p><strong>Features:</strong></p>
 * <ul>
 *   <li>Configurable storage path and base URL</li>
 *   <li>UUID-based unique filenames to prevent collisions</li>
 *   <li>Automatic directory creation on startup</li>
 *   <li>File serving via public URL</li>
 * </ul>
 *
 * @param mediaRepository Repository for persisting media metadata
 * @param storagePath Filesystem path for storing uploaded files
 * @param baseUrl Base URL for constructing public file URLs
 */
@Service
class LocalFileStorageService(
    private val mediaRepository: MediaRepository,
    @Value("\${media.storage.path:./uploads}") private val storagePath: String,
    @Value("\${media.storage.base-url:http://localhost:8080/api/v1/media/files}") private val baseUrl: String,
) {
    /**
     * Ensures the storage directory exists on application startup.
     */
    @PostConstruct
    fun init() {
        val path = Paths.get(storagePath)
        if (!Files.exists(path)) {
            Files.createDirectories(path)
            logger.info { "Created media storage directory: $storagePath" }
        } else {
            logger.info { "Using existing media storage directory: $storagePath" }
        }
    }

    /**
     * Uploads a file to local storage and persists metadata to the database.
     *
     * @param file The multipart file to upload
     * @param entryId Optional directory entry ID to associate with
     * @param category Optional category for the media (e.g., "hero", "gallery")
     * @param description Optional user-provided description
     * @param uploadedBy Optional identifier of the user who uploaded
     * @return The created Media entity with all metadata
     */
    fun uploadFile(
        file: MultipartFile,
        entryId: UUID? = null,
        category: String? = null,
        description: String? = null,
        uploadedBy: String? = null,
    ): Media {
        val originalFileName = file.originalFilename ?: "file"
        val extension = originalFileName.substringAfterLast('.', "")
        val uniqueFileName = "${UUID.randomUUID()}.$extension"

        val targetPath = Paths.get(storagePath, uniqueFileName)
        file.transferTo(targetPath.toFile())

        logger.info { "Uploaded file: $originalFileName -> $targetPath (${file.size} bytes)" }

        val media = Media(
            fileName = uniqueFileName,
            originalName = originalFileName,
            contentType = file.contentType ?: "application/octet-stream",
            fileSize = file.size,
            storagePath = targetPath.toAbsolutePath().toString(),
            publicUrl = "$baseUrl/$uniqueFileName",
            entryId = entryId,
            category = category,
            description = description,
            uploadedBy = uploadedBy,
        )

        return mediaRepository.save(media)
    }

    /**
     * Gets the filesystem path for a stored file.
     *
     * @param fileName The unique filename (not original name)
     * @return Path to the file on the filesystem
     */
    fun getFilePath(fileName: String): Path {
        return Paths.get(storagePath, fileName)
    }

    /**
     * Checks if a file exists in storage.
     *
     * @param fileName The unique filename
     * @return true if the file exists, false otherwise
     */
    fun fileExists(fileName: String): Boolean {
        return Files.exists(getFilePath(fileName))
    }

    /**
     * Deletes a media file from storage and removes its database record.
     *
     * @param media The media entity to delete
     */
    fun deleteFile(media: Media) {
        val path = Paths.get(media.storagePath)
        if (Files.exists(path)) {
            Files.delete(path)
            logger.info { "Deleted file: ${media.storagePath}" }
        } else {
            logger.warn { "File not found for deletion: ${media.storagePath}" }
        }
        mediaRepository.delete(media)
        logger.info { "Deleted media record: ${media.id}" }
    }

    /**
     * Deletes a media file by its ID.
     *
     * @param mediaId The UUID of the media to delete
     * @throws NoSuchElementException if the media is not found
     */
    fun deleteFileById(mediaId: UUID) {
        val media = mediaRepository.findById(mediaId)
            .orElseThrow { NoSuchElementException("Media not found: $mediaId") }
        deleteFile(media)
    }
}
