package com.nosilha.core.media.api

import com.nosilha.core.media.domain.FileStorageService
import com.nosilha.core.shared.api.ApiResponse
import com.nosilha.core.shared.api.MediaMetadataDto
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

/**
 * REST controller for handling media-related operations, such as file uploads.
 *
 * This controller is only enabled when gcp.enabled=true (default). In test environments,
 * set gcp.enabled=false to prevent this controller from loading since it depends on
 * FileStorageService which requires GCP credentials.
 *
 * @param fileStorageService The service responsible for the underlying file storage logic.
 */
@RestController
@RequestMapping("/api/v1/media")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    prefix = "gcp",
    name = ["enabled"],
    havingValue = "true",
    matchIfMissing = true,
)
class FileUploadController(
    private val fileStorageService: FileStorageService,
) {
    /**
     * Handles the uploading of a single file via a multipart/form-data request.
     *
     * Upon successful upload, it returns comprehensive metadata about the uploaded file
     * wrapped in an ApiResponse. The `@ResponseStatus(HttpStatus.CREATED)`
     * annotation ensures a 201 status code is returned on success.
     *
     * @param file The file to be uploaded, bound from the "file" part of the request.
     * @param category Optional category for file organization.
     * @param description Optional description of the file.
     * @return ApiResponse containing detailed media metadata.
     */
    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("category", required = false) category: String?,
        @RequestParam("description", required = false) description: String?,
    ): ApiResponse<MediaMetadataDto> {
        val publicUrl = fileStorageService.uploadFile(file)

        // Create comprehensive metadata response
        val mediaMetadata =
            MediaMetadataDto(
                id = java.util.UUID.randomUUID().toString(),
                fileName = file.originalFilename ?: "unknown",
                originalName = file.originalFilename ?: "unknown",
                contentType = file.contentType ?: "application/octet-stream",
                size = file.size,
                url = publicUrl,
                category = category,
                description = description,
                uploadedAt = LocalDateTime.now(),
                uploadedBy = null, // TODO: Extract from JWT token when authentication is implemented
                aiMetadata = null, // TODO: Implement AI processing integration
            )

        return ApiResponse(data = mediaMetadata, status = HttpStatus.CREATED.value())
    }

    /**
     * Retrieves metadata for a specific media file by its ID.
     *
     * @param id The unique identifier of the media file.
     * @return ApiResponse containing media metadata.
     */
    @GetMapping("/{id}")
    fun getMediaMetadata(
        @PathVariable id: String,
    ): ApiResponse<MediaMetadataDto> {
        // TODO: Implement actual metadata retrieval from database/storage
        // For now, return a placeholder response
        val mediaMetadata =
            MediaMetadataDto(
                id = id,
                fileName = "placeholder.jpg",
                originalName = "placeholder.jpg",
                contentType = "image/jpeg",
                size = 1024000,
                url = "https://example.com/placeholder.jpg",
                uploadedAt = LocalDateTime.now(),
            )

        return ApiResponse(data = mediaMetadata)
    }
}
