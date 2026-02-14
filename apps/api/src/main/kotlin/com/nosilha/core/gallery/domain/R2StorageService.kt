package com.nosilha.core.gallery.domain

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request
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
 * Result of listing objects in an R2 bucket.
 *
 * @property objects List of objects found
 * @property continuationToken Token for fetching the next page, null if no more pages
 * @property isTruncated Whether there are more objects beyond this page
 */
data class R2ListResult(
    val objects: List<R2ObjectInfo>,
    val continuationToken: String?,
    val isTruncated: Boolean,
)

/**
 * Metadata for a single R2 object from a list operation.
 *
 * @property key Storage key (path within bucket)
 * @property size Object size in bytes
 * @property lastModified When the object was last modified
 */
data class R2ObjectInfo(
    val key: String,
    val size: Long,
    val lastModified: Instant,
)

/**
 * Detailed metadata for a single R2 object from a head operation.
 *
 * @property contentType MIME content type
 * @property contentLength File size in bytes
 * @property lastModified When the object was last modified
 */
data class R2ObjectMetadata(
    val contentType: String,
    val contentLength: Long,
    val lastModified: Instant,
)

/**
 * Service for Cloudflare R2 storage operations using S3-compatible API.
 *
 * Provides presigned URL generation for direct browser uploads and
 * object management operations (delete, verify).
 *
 * R2 is accessed via AWS SDK using the S3 API with a custom endpoint.
 *
 * This service is only instantiated when R2 is explicitly enabled via
 * `cloudflare.r2.enabled=true`. When enabled, all required credentials
 * must be provided or the application will fail to start (fail-fast behavior).
 *
 * @see PresignedPutUrlResult
 */
@Service
@ConditionalOnProperty(
    prefix = "cloudflare.r2",
    name = ["enabled"],
    havingValue = "true",
    matchIfMissing = false,
)
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
        // Fail-fast: If R2 is enabled but credentials are missing, fail at startup
        require(accountId.isNotBlank()) {
            "R2 storage is enabled but cloudflare.r2.account-id is not configured"
        }
        require(accessKeyId.isNotBlank()) {
            "R2 storage is enabled but cloudflare.r2.access-key-id is not configured"
        }
        require(secretAccessKey.isNotBlank()) {
            "R2 storage is enabled but cloudflare.r2.secret-access-key is not configured"
        }

        val endpoint = URI.create("https://$accountId.r2.cloudflarestorage.com")
        val credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey)

        s3Client = S3Client
            .builder()
            .endpointOverride(endpoint)
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.of("auto"))
            .build()

        s3Presigner = S3Presigner
            .builder()
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

        val putObjectRequest = software.amazon.awssdk.services.s3.model.PutObjectRequest
            .builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build()

        val presignRequest = PutObjectPresignRequest
            .builder()
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
    fun getPublicUrl(key: String): String = "$publicUrl/$key"

    /**
     * Lists objects in the R2 bucket with optional prefix filtering and pagination.
     *
     * @param prefix Optional key prefix to filter by (e.g., "uploads/2025/")
     * @param continuationToken Token from previous response for pagination
     * @param maxKeys Maximum number of objects to return (clamped to 1000)
     * @return R2ListResult with objects, continuation token, and truncation flag
     * @throws IllegalStateException if R2 is not configured
     */
    fun listObjects(
        prefix: String? = null,
        continuationToken: String? = null,
        maxKeys: Int = 100,
    ): R2ListResult {
        check(isConfigured) { "R2 storage is not configured" }

        val clampedMaxKeys = maxKeys.coerceIn(1, 1000)
        val requestBuilder = ListObjectsV2Request
            .builder()
            .bucket(bucketName)
            .maxKeys(clampedMaxKeys)

        prefix?.let { requestBuilder.prefix(it) }
        continuationToken?.let { requestBuilder.continuationToken(it) }

        val response = s3Client.listObjectsV2(requestBuilder.build())

        val objects = response.contents().map { obj ->
            R2ObjectInfo(
                key = obj.key(),
                size = obj.size(),
                lastModified = obj.lastModified(),
            )
        }

        logger.debug { "Listed ${objects.size} objects (prefix=$prefix, truncated=${response.isTruncated})" }

        return R2ListResult(
            objects = objects,
            continuationToken = if (response.isTruncated) response.nextContinuationToken() else null,
            isTruncated = response.isTruncated,
        )
    }

    /**
     * Fetches metadata for a single R2 object via HeadObject.
     *
     * @param key The storage key to inspect
     * @return R2ObjectMetadata with contentType, contentLength, lastModified, or null if not found
     * @throws IllegalStateException if R2 is not configured
     */
    fun headObject(key: String): R2ObjectMetadata? {
        check(isConfigured) { "R2 storage is not configured" }

        return try {
            val request = HeadObjectRequest
                .builder()
                .bucket(bucketName)
                .key(key)
                .build()
            val response = s3Client.headObject(request)
            R2ObjectMetadata(
                contentType = response.contentType() ?: "application/octet-stream",
                contentLength = response.contentLength(),
                lastModified = response.lastModified(),
            )
        } catch (_: NoSuchKeyException) {
            null
        }
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
            val request = HeadObjectRequest
                .builder()
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

        val request = DeleteObjectRequest
            .builder()
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
    private fun sanitizeFileName(fileName: String): String =
        fileName
            .replace(Regex("[^a-zA-Z0-9._-]"), "_")
            .take(100)
}
