package com.nosilha.core.service

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

/**
 * A service to handle file storage operations using Google Cloud Storage (GCS).
 *
 * @param storage The Google Cloud Storage client, auto-configured by Spring Cloud GCP.
 * @param bucketName The name of the GCS bucket, injected from application properties.
 */
@Service
class FileStorageService(
    private val storage: Storage,
    @Value("\${gcp.gcs-bucket-name}") private val bucketName: String
) {

  /**
   * Uploads a file to the configured Google Cloud Storage bucket.
   *
   * It generates a unique name for the file to prevent collisions and returns
   * the publicly accessible URL of the uploaded object.
   *
   * @param file The file to upload, received from a multipart request.
   * @return The public URL string of the newly uploaded file.
   */
  fun uploadFile(file: MultipartFile): String {
    // 1. Generate a unique filename to avoid collisions.
    val originalFileName = file.originalFilename ?: "file"
    val extension = originalFileName.substringAfterLast('.', "")
    val uniqueFileName = "${UUID.randomUUID()}.$extension"

    // 2. Create a BlobId which uniquely identifies the object in GCS.
    val blobId = BlobId.of(bucketName, uniqueFileName)

    // 3. Create BlobInfo with metadata. Setting the content type is good practice.
    val blobInfo = BlobInfo.newBuilder(blobId)
        .setContentType(file.contentType)
        .build()

    // 4. Perform the upload to GCS.
    storage.create(blobInfo, file.bytes)

    // 5. Return the public URL of the uploaded file.
    return "https://storage.googleapis.com/$bucketName/$uniqueFileName"
  }
}