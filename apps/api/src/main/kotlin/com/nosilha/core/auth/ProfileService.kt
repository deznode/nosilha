package com.nosilha.core.auth

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.nosilha.core.auth.api.dto.ContributionsDto
import com.nosilha.core.auth.api.dto.ProfileDto
import com.nosilha.core.auth.api.dto.ProfileUpdateRequest
import com.nosilha.core.auth.api.dto.StorySummaryDto
import com.nosilha.core.auth.api.dto.SuggestionSummaryDto
import com.nosilha.core.auth.repository.UserProfileRepository
import com.nosilha.core.engagement.domain.ReactionType
import com.nosilha.core.engagement.repository.ReactionRepository
import com.nosilha.core.feedback.repository.SuggestionRepository
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import com.nosilha.core.stories.repository.StorySubmissionRepository
import io.github.bucket4j.Bucket
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.util.UUID
import java.util.concurrent.TimeUnit

private val logger = KotlinLogging.logger {}

/**
 * Service for managing user profiles and contribution history.
 *
 * <p>Implements business logic for:
 * <ul>
 *   <li>Profile retrieval with automatic creation (getOrCreate pattern)</li>
 *   <li>Aggregating user contributions (reactions, suggestions, stories)</li>
 *   <li>Profile data management and preferences</li>
 * </ul>
 *
 * <p><strong>Profile Auto-Creation</strong>: When a user's profile is requested but doesn't exist,
 * a new profile is automatically created with default values (EN language, default notification preferences).
 * This ensures all authenticated users have a profile without requiring explicit signup.</p>
 *
 * <p><strong>Contributions Aggregation</strong>: Combines data from multiple modules:
 * <ul>
 *   <li>Reactions: Grouped by type with counts</li>
 *   <li>Suggestions: List of content improvement suggestions with status</li>
 *   <li>Stories: List of submitted stories with moderation status</li>
 * </ul>
 */
@Service
@Transactional
@Suppress("UnusedPrivateProperty") // suggestionRepository will be used after Suggestion entity gets userId field
class ProfileService(
    private val userProfileRepository: UserProfileRepository,
    private val reactionRepository: ReactionRepository,
    private val suggestionRepository: SuggestionRepository,
    private val storySubmissionRepository: StorySubmissionRepository,
) {
    companion object {
        private const val MAX_UPDATES_PER_MINUTE = 10L
    }

    /**
     * Caffeine cache for rate limiting by user ID.
     *
     * Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. Each user gets a bucket that refills 10 tokens per minute.
     */
    private val rateLimitBuckets: Cache<String, Bucket> = Caffeine
        .newBuilder()
        .maximumSize(10_000)
        .expireAfterAccess(1, TimeUnit.HOURS)
        .build()

    /**
     * Retrieves a user's profile, creating it if it doesn't exist.
     *
     * <p>This method implements the "getOrCreate" pattern to ensure all authenticated users
     * have a profile. If a profile doesn't exist for the given userId, a new profile is
     * created with default values:</p>
     * <ul>
     *   <li>Preferred Language: EN (English)</li>
     *   <li>Notification Preferences: Default opt-in values from NotificationPreferences</li>
     *   <li>Display Name: null</li>
     *   <li>Location: null</li>
     * </ul>
     *
     * <p><strong>Race Condition Handling</strong>: Uses PostgreSQL's ON CONFLICT DO NOTHING
     * via {@link UserProfileRepository#insertIfNotExists} to atomically handle concurrent
     * profile creation requests. This is a single database operation with no race window.</p>
     *
     * @param userId Supabase auth user ID from JWT token
     * @return ProfileDto containing the user's profile information
     */
    fun getOrCreateProfile(userId: String): ProfileDto {
        logger.debug { "Retrieving profile for user: $userId" }

        // Try to find existing profile first (most common case)
        userProfileRepository.findByUserId(userId)?.let {
            return ProfileDto.fromEntity(it)
        }

        // Atomically insert if not exists (handles race condition at database level)
        val rowsInserted = userProfileRepository.insertIfNotExists(userId)
        if (rowsInserted > 0) {
            logger.info { "Created default profile for user: $userId" }
        }

        // Fetch the profile (either we created it, or another thread did)
        val profile = userProfileRepository.findByUserId(userId)
            ?: throw IllegalStateException("Profile should exist after upsert for user: $userId")

        return ProfileDto.fromEntity(profile)
    }

    /**
     * Updates an existing user profile with provided values.
     *
     * <p>Implements partial update semantics - only non-null fields in the request
     * are applied to the profile. The profile must already exist (should be created
     * via getOrCreateProfile during initial authentication).</p>
     *
     * <p><strong>Rate Limiting</strong>: Maximum 10 updates per minute per user to prevent
     * abuse. This is enforced using an in-memory sliding window rate limiter.</p>
     *
     * <p><strong>Partial Update Rules</strong>:
     * <ul>
     *   <li>displayName: Set to provided value if not null</li>
     *   <li>location: Set to provided value if not null</li>
     *   <li>preferredLanguage: Set to provided value if not null</li>
     *   <li>notificationPreferences: Fully replaced if not null</li>
     * </ul>
     *
     * @param userId Supabase auth user ID from JWT token
     * @param request ProfileUpdateRequest with optional fields to update
     * @return ProfileDto with the updated profile data
     * @throws ResourceNotFoundException if profile doesn't exist for userId
     * @throws RateLimitExceededException if user exceeds 10 updates/minute
     */
    fun updateProfile(
        userId: String,
        request: ProfileUpdateRequest,
    ): ProfileDto {
        logger.debug { "Updating profile for user: $userId" }

        // Check rate limit before proceeding
        if (!checkRateLimit(userId)) {
            logger.warn { "Rate limit exceeded for user $userId (max $MAX_UPDATES_PER_MINUTE updates/minute)" }
            throw RateLimitExceededException(
                "Too many profile updates. Maximum $MAX_UPDATES_PER_MINUTE updates per minute allowed.",
            )
        }

        val profile = userProfileRepository.findByUserId(userId)
            ?: throw ResourceNotFoundException("Profile not found for user: $userId")

        // Apply non-null fields from request (partial update)
        request.displayName?.let { profile.displayName = it }
        request.location?.let { profile.location = it }
        request.preferredLanguage?.let { profile.preferredLanguage = it }
        request.notificationPreferences?.let { profile.notificationPreferences = it }

        val updatedProfile = userProfileRepository.save(profile)

        logger.info { "Profile updated successfully for user: $userId" }

        return ProfileDto.fromEntity(updatedProfile)
    }

    /**
     * Checks if user is within rate limit for profile updates.
     *
     * Uses Bucket4j's token bucket algorithm for atomic, race-condition-free
     * rate limiting. Each user gets a bucket with 10 tokens that refill every minute.
     *
     * @param userId String user ID to check
     * @return true if within rate limit (token consumed), false if exceeded
     */
    private fun checkRateLimit(userId: String): Boolean = getBucketForUser(userId).tryConsume(1)

    /**
     * Gets or creates a rate limit bucket for the given user ID.
     *
     * @param userId User ID to get bucket for
     * @return Bucket configured for rate limiting (10 requests/minute)
     */
    private fun getBucketForUser(userId: String): Bucket =
        rateLimitBuckets.get(userId) {
            logger.debug { "Creating rate limit bucket for user: $userId" }
            Bucket
                .builder()
                .addLimit { limit ->
                    limit
                        .capacity(MAX_UPDATES_PER_MINUTE)
                        .refillIntervally(MAX_UPDATES_PER_MINUTE, Duration.ofMinutes(1))
                }.build()
        }

    /**
     * Aggregates all contributions made by a user across the platform.
     *
     * <p>Retrieves and combines contribution data from multiple sources:
     * <ul>
     *   <li><strong>Reactions</strong>: Aggregated counts grouped by reaction type
     *       (LOVE, CELEBRATE, INSIGHTFUL, SUPPORT)</li>
     *   <li><strong>Suggestions</strong>: List of content improvement suggestions with
     *       type and status (PENDING, APPROVED, REJECTED). Returns empty list if the
     *       Suggestion entity doesn't have a userId field yet.</li>
     *   <li><strong>Stories</strong>: List of submitted stories with type and moderation
     *       status (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED)</li>
     * </ul>
     *
     * <p>Note: The userId for reactions is a UUID, while for suggestions and stories it's a String.
     * This method handles the conversion appropriately.</p>
     *
     * @param userId Supabase auth user ID (String format)
     * @return ContributionsDto with aggregated counts and lists of contributions
     */
    @Transactional(readOnly = true)
    fun getContributions(userId: String): ContributionsDto {
        logger.debug { "Retrieving contributions for user: $userId" }

        // Convert userId String to UUID for reaction queries
        val userUuid = try {
            UUID.fromString(userId)
        } catch (e: IllegalArgumentException) {
            logger.warn { "Invalid UUID format for userId: $userId" }
            // If userId is not a valid UUID, return empty contributions
            return ContributionsDto(
                reactionCounts = emptyMap(),
                suggestions = emptyList(),
                stories = emptyList(),
                totalReactions = 0,
                totalSuggestions = 0,
                totalStories = 0,
            )
        }

        // Get reaction counts grouped by type
        val reactionCounts = getReactionCountsByUser(userUuid)

        // Get suggestions submitted by user
        // TODO: Re-enable once Suggestion entity has userId field
        // Note: Suggestion entity currently uses name/email, not userId
        val suggestions = emptyList<SuggestionSummaryDto>()
        // val suggestions = try {
        //     suggestionRepository.findByUserId(userId).map { suggestion ->
        //         SuggestionSummaryDto(
        //             id = suggestion.id!!,
        //             contentId = suggestion.contentId,
        //             suggestionType = suggestion.suggestionType,
        //             status = suggestion.status,
        //             createdAt = suggestion.createdAt!!.let { instant ->
        //                 java.time.LocalDateTime.ofInstant(instant, java.time.ZoneOffset.UTC)
        //             },
        //         )
        //     }
        // } catch (e: Exception) {
        //     logger.warn("Error retrieving suggestions for user {}: {}", userId, e.message)
        //     emptyList()
        // }

        // Get stories submitted by user
        val stories = storySubmissionRepository.findByAuthorIdOrderByCreatedAtDesc(userId).map { story ->
            StorySummaryDto(
                id = story.id!!,
                title = story.title,
                storyType = story.storyType,
                status = story.status,
                createdAt = story.createdAt!!.let { instant ->
                    java.time.LocalDateTime.ofInstant(instant, java.time.ZoneOffset.UTC)
                },
            )
        }

        val totalReactions = reactionCounts.values.sum()
        val totalSuggestions = suggestions.size
        val totalStories = stories.size

        logger.debug {
            "Retrieved contributions for user $userId: $totalReactions reactions, $totalSuggestions suggestions, $totalStories stories"
        }

        return ContributionsDto(
            reactionCounts = reactionCounts,
            suggestions = suggestions,
            stories = stories,
            totalReactions = totalReactions,
            totalSuggestions = totalSuggestions,
            totalStories = totalStories,
        )
    }

    /**
     * Gets aggregated reaction counts for a user, grouped by reaction type.
     *
     * Uses the repository's query to efficiently retrieve counts in a single database call.
     * Returns a map with all reaction types, even if the count is 0.
     *
     * @param userId User UUID
     * @return Map of reaction type to count
     */
    private fun getReactionCountsByUser(userId: UUID): Map<ReactionType, Int> {
        val counts = reactionRepository.countByUserIdGroupByReactionType(userId)
        val aggregated = counts.associate { it.type to it.count.toInt() }

        return ReactionType.entries.associateWith { type -> aggregated[type] ?: 0 }
    }
}
