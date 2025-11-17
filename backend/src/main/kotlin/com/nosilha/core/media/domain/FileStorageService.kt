package com.nosilha.core.media.domain

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.nosilha.core.media.repository.ImageMetadataRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

/**
 * A service to handle file storage operations using Google Cloud Storage (GCS)
 * and trigger subsequent AI analysis.
 *
 * @param storage The Google Cloud Storage client.
 * @param bucketName The name of the GCS bucket.
 * @param aiService The service for performing AI vision analysis.
 * @param imageMetadataRepository The repository for saving analysis results to Firestore.
 */
@Service
class FileStorageService(
    private val storage: Storage,
    @Value("\${gcp.gcs-bucket-name}") private val bucketName: String,
    private val aiService: AIService,
    private val imageMetadataRepository: ImageMetadataRepository,
) {
    /**
     * Uploads a file to GCS, triggers AI analysis, and saves the metadata to Firestore.
     *
     * @param file The file to upload.
     * @return The public URL string of the newly uploaded file.
     */
    fun uploadFile(file: MultipartFile): String {
        // 1. Generate a unique filename and upload the object to GCS.
        val originalFileName = file.originalFilename ?: "file"
        val extension = originalFileName.substringAfterLast('.', "")
        val uniqueFileName = "${UUID.randomUUID()}.$extension"

        val blobId = BlobId.of(bucketName, uniqueFileName)
        val blobInfo =
            BlobInfo
                .newBuilder(blobId)
                .setContentType(file.contentType)
                .build()
        storage.create(blobInfo, file.bytes)

        // 2. After successful upload, trigger the AI analysis and metadata persistence.
        val gcsPath = "gs://$bucketName/$uniqueFileName"
        val publicUrl = "https://storage.googleapis.com/$bucketName/$uniqueFileName"

        // Generate tags using the AI service.
        val tags = aiService.generateTagsForImage(gcsPath)

        // Create the metadata object if tags were found.
        if (tags.isNotEmpty()) {
            val metadata = ImageMetadata(gcsUrl = publicUrl, tags = tags)
            // Save to Firestore reactively. .subscribe() triggers the non-blocking operation.
            imageMetadataRepository.save(metadata).subscribe()
        }

        // 3. Return the public URL immediately to the client.
        return publicUrl
    }
}
