package com.nosilha.core.media.api

import com.nosilha.core.media.domain.LocalFileStorageService
import com.nosilha.core.media.domain.Media
import com.nosilha.core.media.repository.MediaRepository
import com.nosilha.core.shared.api.AIMetadataDto
import com.nosilha.core.shared.api.ApiResponse
import com.nosilha.core.shared.api.MediaMetadataDto
import org.springframework.core.io.PathResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.UUID

/**
 * REST controller for handling media-related operations.
 *
 * <p>Provides endpoints for file upload, retrieval, and management.
 * Files are stored on the local filesystem with metadata persisted in PostgreSQL.</p>
 *
 * @param fileStorageService Service for local filesystem storage operations
 * @param mediaRepository Repository for media metadata persistence
 */
@RestController
@RequestMapping("/api/v1/media")
class FileUploadController(
    private val fileStorageService: LocalFileStorageService,
    private val mediaRepository: MediaRepository,
) {
    /**
     * Uploads a file and persists its metadata.
     *
     * @param file The file to upload
     * @param entryId Optional directory entry to associate with
     * @param category Optional category for organization (e.g., "hero", "gallery")
     * @param description Optional user-provided description
     * @return ApiResponse containing the created media metadata
     */
    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("entryId", required = false) entryId: UUID?,
        @RequestParam("category", required = false) category: String?,
        @RequestParam("description", required = false) description: String?,
    ): ApiResponse<MediaMetadataDto> {
        val media = fileStorageService.uploadFile(
            file = file,
            entryId = entryId,
            category = category,
            description = description,
        )

        return ApiResponse(
            data = media.toDto(),
            status = HttpStatus.CREATED.value(),
        )
    }

    /**
     * Retrieves metadata for a specific media file.
     *
     * @param id The UUID of the media
     * @return ApiResponse containing media metadata
     */
    @GetMapping("/{id}")
    fun getMediaMetadata(
        @PathVariable id: UUID,
    ): ApiResponse<MediaMetadataDto> {
        val media = mediaRepository.findById(id)
            .orElseThrow { NoSuchElementException("Media not found: $id") }

        return ApiResponse(data = media.toDto())
    }

    /**
     * Serves a media file by its unique filename.
     *
     * @param fileName The stored filename (UUID-based)
     * @return The file content with appropriate content type
     */
    @GetMapping("/files/{fileName}")
    fun serveFile(
        @PathVariable fileName: String,
    ): ResponseEntity<Resource> {
        val path = fileStorageService.getFilePath(fileName)

        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build()
        }

        val resource = PathResource(path)
        val contentType = Files.probeContentType(path) ?: "application/octet-stream"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"$fileName\"")
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource)
    }

    /**
     * Retrieves all media associated with a directory entry.
     *
     * @param entryId The UUID of the directory entry
     * @return ApiResponse containing list of media metadata
     */
    @GetMapping("/entry/{entryId}")
    fun getMediaForEntry(
        @PathVariable entryId: UUID,
    ): ApiResponse<List<MediaMetadataDto>> {
        val mediaList = mediaRepository.findByEntryIdOrderByDisplayOrderAsc(entryId)
        return ApiResponse(data = mediaList.map { it.toDto() })
    }

    /**
     * Deletes a media file and its metadata.
     *
     * @param id The UUID of the media to delete
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMedia(
        @PathVariable id: UUID,
    ) {
        fileStorageService.deleteFileById(id)
    }

    /**
     * Converts a Media entity to its DTO representation.
     */
    private fun Media.toDto(): MediaMetadataDto {
        // Convert AI metadata if present
        val aiMetadata = if (aiTags != null || aiAltText != null || aiDescription != null) {
            AIMetadataDto(
                labels = aiTags?.toList() ?: emptyList(),
                textDetected = emptyList(),
                landmarks = emptyList(),
                processedAt = aiProcessedAt?.let {
                    LocalDateTime.ofInstant(it, ZoneId.systemDefault())
                },
            )
        } else {
            null
        }

        return MediaMetadataDto(
            id = id.toString(),
            fileName = fileName,
            originalName = originalName,
            contentType = contentType,
            size = fileSize,
            url = publicUrl ?: "",
            category = category,
            description = description,
            uploadedAt = createdAt,
            uploadedBy = uploadedBy,
            aiMetadata = aiMetadata,
        )
    }
}
