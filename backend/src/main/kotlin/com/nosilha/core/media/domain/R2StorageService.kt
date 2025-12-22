package com.nosilha.core.media.domain

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.net.URI
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Result of generating a presigned PUT URL for R2 uploads.
 *
 * @property uploadUrl The presigned URL for direct browser-to-R2 upload
 * @property key The storage key to use in confirm request
 * @property expiresAt When the presigned URL expires
 */
data class PresignedPutUrlResult(
    val uploadUrl: String,
    val key: String,
    val expiresAt: Instant,
)

/**
 * Service for Cloudflare R2 storage operations using S3-compatible API.
 *
 * Provides presigned URL generation for direct browser uploads and
 * object management operations (delete, verify).
 *
 * R2 is accessed via AWS SDK using the S3 API with a custom endpoint.
 *
 * @see PresignedPutUrlResult
 */
@Service
class R2StorageService(
    @Value("\${cloudflare.r2.account-id:}") private val accountId: String,
    @Value("\${cloudflare.r2.access-key-id:}") private val accessKeyId: String,
    @Value("\${cloudflare.r2.secret-access-key:}") private val secretAccessKey: String,
    @Value("\${cloudflare.r2.bucket-name:nosilha-media}") private val bucketName: String,
    @Value("\${cloudflare.r2.public-url:https://media.nosilha.com}") private val publicUrl: String,
) {
    private lateinit var s3Client: S3Client
    private lateinit var s3Presigner: S3Presigner

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy/MM")

    /** Whether R2 is configured and available. */
    val isConfigured: Boolean
        get() = accountId.isNotBlank() && accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()

    @PostConstruct
    fun init() {
        if (!isConfigured) {
            logger.warn { "R2 storage not configured - presigned URLs will not work" }
            return
        }

        val endpoint = URI.create("https://$accountId.r2.cloudflarestorage.com")
        val credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey)

        s3Client = S3Client.builder()
            .endpointOverride(endpoint)
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.of("auto"))
            .build()

        s3Presigner = S3Presigner.builder()
            .endpointOverride(endpoint)
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.of("auto"))
            .build()

        logger.info { "R2 storage service initialized for bucket: $bucketName" }
    }

    /**
     * Generates a presigned PUT URL for direct browser-to-R2 upload.
     *
     * The URL is valid for the specified duration (default 10 minutes).
     * After upload, the client should call confirm with the returned key.
     *
     * @param fileName Original filename (used for extension extraction)
     * @param contentType MIME type of the file
     * @param expiryMinutes How long the URL is valid (default: 10)
     * @return PresignedPutUrlResult with uploadUrl, key, and expiration
     * @throws IllegalStateException if R2 is not configured
     */
    fun generatePresignedPutUrl(
        fileName: String,
        contentType: String,
        expiryMinutes: Int = 10,
    ): PresignedPutUrlResult {
        check(isConfigured) { "R2 storage is not configured" }

        val key = generateStorageKey(fileName)
        val expiry = Duration.ofMinutes(expiryMinutes.toLong())

        val putObjectRequest = software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build()

        val presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(expiry)
            .putObjectRequest(putObjectRequest)
            .build()

        val presignedRequest: PresignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest)
        val expiresAt = Instant.now().plus(expiry)

        logger.debug { "Generated presigned PUT URL for key: $key (expires: $expiresAt)" }

        return PresignedPutUrlResult(
            uploadUrl = presignedRequest.url().toString(),
            key = key,
            expiresAt = expiresAt,
        )
    }

    /**
     * Constructs the public URL for an uploaded object.
     *
     * @param key The storage key of the object
     * @return Full public URL for accessing the object
     */
    fun getPublicUrl(key: String): String {
        return "$publicUrl/$key"
    }

    /**
     * Verifies that an object exists in R2 storage.
     *
     * @param key The storage key to check
     * @return true if object exists, false otherwise
     * @throws IllegalStateException if R2 is not configured
     */
    fun objectExists(key: String): Boolean {
        check(isConfigured) { "R2 storage is not configured" }

        return try {
            val request = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build()
            s3Client.headObject(request)
            true
        } catch (_: NoSuchKeyException) {
            false
        }
    }

    /**
     * Permanently deletes an object from R2 storage.
     *
     * @param key The storage key of the object to delete
     * @throws IllegalStateException if R2 is not configured
     */
    fun deleteObject(key: String) {
        check(isConfigured) { "R2 storage is not configured" }

        val request = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()

        s3Client.deleteObject(request)
        logger.info { "Deleted object from R2: $key" }
    }

    /**
     * Generates a unique storage key with date-based organization.
     *
     * Format: uploads/YYYY/MM/UUID-originalFileName
     *
     * @param originalFileName The original filename
     * @return Unique storage key
     */
    private fun generateStorageKey(originalFileName: String): String {
        val datePath = LocalDate.now().format(dateFormatter)
        val uniqueId = UUID.randomUUID().toString()
        val safeFileName = sanitizeFileName(originalFileName)
        return "uploads/$datePath/$uniqueId-$safeFileName"
    }

    /**
     * Sanitizes filename for safe storage key usage.
     *
     * Removes or replaces characters that might cause issues in URLs or keys.
     */
    private fun sanitizeFileName(fileName: String): String {
        return fileName
            .replace(Regex("[^a-zA-Z0-9._-]"), "_")
            .take(100)
    }
}
