package com.nosilha.core.contentactions

import com.nosilha.core.contentactions.api.ReactionCountsDto
import com.nosilha.core.contentactions.api.ReactionCreateDto
import com.nosilha.core.contentactions.api.ReactionResponseDto
import com.nosilha.core.contentactions.domain.Reaction
import com.nosilha.core.contentactions.domain.ReactionType
import com.nosilha.core.contentactions.repository.ReactionRepository
import com.nosilha.core.shared.exception.RateLimitExceededException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedDeque

/**
 * Service for managing user reactions to cultural heritage content.
 *
 * <p>Implements business logic for:
 * <ul>
 *   <li>Submitting reactions with rate limiting (10/minute per user)</li>
 *   <li>Removing or changing reactions (optimistic UI support)</li>
 *   <li>Retrieving aggregated reaction counts with caching</li>
 *   <li>Enforcing unique constraint (one reaction per user per content)</li>
 * </ul>
 *
 * <p><strong>Rate Limiting</strong>: In-memory rate limiter tracks submissions per user.
 * Production deployments should use Redis or similar for distributed rate limiting.</p>
 *
 * <p><strong>Caching</strong>: Reaction counts cached for 5 minutes to reduce database load
 * while maintaining reasonable freshness for community engagement metrics.</p>
 */
@Service
@Transactional
class ReactionService(
    private val reactionRepository: ReactionRepository,
    private val cacheManager: CacheManager,
) {
    private val logger = LoggerFactory.getLogger(ReactionService::class.java)

    // In-memory rate limiter: userId -> list of recent submission timestamps
    // TODO: Replace with Redis-based rate limiter for production (distributed instances)
    private val rateLimiter = ConcurrentHashMap<UUID, ConcurrentLinkedDeque<Instant>>()

    companion object {
        private const val MAX_REACTIONS_PER_MINUTE = 10
        private const val RATE_LIMIT_WINDOW_SECONDS = 60L
        private const val CACHE_NAME = "reactionCounts"
        private const val CACHE_TTL_MINUTES = 5
    }

    /**
     * Submits a new reaction or updates an existing reaction.
     *
     * <p><strong>Business Rules</strong>:
     * <ul>
     *   <li>User can have only one reaction per content (unique constraint)</li>
     *   <li>Clicking same reaction type removes the reaction</li>
     *   <li>Clicking different reaction type replaces the old reaction</li>
     *   <li>Rate limit: 10 reactions per minute per user</li>
     * </ul>
     *
     * <p><strong>Optimistic UI Support</strong>: Frontend can optimistically update counts
     * before this call completes. If this fails, frontend should rollback the UI change.</p>
     *
     * @param userId UUID of the authenticated user (from JWT token)
     * @param createDto Contains contentId and reactionType
     * @return ReactionSubmissionResult describing the persisted state and action taken
     * @throws RateLimitExceededException if user exceeds 10 reactions/minute
     * @throws IllegalArgumentException if contentId or reaction type is invalid
     */
    @CacheEvict(value = [CACHE_NAME], key = "#createDto.contentId")
    fun submitReaction(
        userId: UUID,
        createDto: ReactionCreateDto,
    ): ReactionSubmissionResult {
        logger.debug(
            "Submitting reaction for user {} on content {}: {}",
            userId,
            createDto.contentId,
            createDto.reactionType,
        )

        // Check rate limit
        if (!checkRateLimit(userId)) {
            logger.warn(
                "Rate limit exceeded for user {} (max {} reactions/minute)",
                userId,
                MAX_REACTIONS_PER_MINUTE,
            )
            throw RateLimitExceededException(
                "Too many reactions. Maximum $MAX_REACTIONS_PER_MINUTE reactions per minute allowed.",
            )
        }

        val existingReaction = reactionRepository.findByUserIdAndContentId(userId, createDto.contentId)

        val resolution = resolveExistingReaction(existingReaction, createDto, userId)
        if (resolution != null) {
            return resolution
        }

        return createOrReplaceReaction(
            userId = userId,
            createDto = createDto,
            replacing = existingReaction != null,
        )
    }

    private fun resolveExistingReaction(
        existingReaction: Reaction?,
        createDto: ReactionCreateDto,
        userId: UUID,
    ): ReactionSubmissionResult? =
        when {
            existingReaction == null -> null
            existingReaction.reactionType == createDto.reactionType -> {
                logger.info(
                    "Removing existing reaction {} for user {} on content {}",
                    createDto.reactionType,
                    userId,
                    createDto.contentId,
                )
                reactionRepository.delete(existingReaction)

                val newCount =
                    reactionRepository.countByContentIdAndReactionType(
                        createDto.contentId,
                        createDto.reactionType,
                    ).toInt()

                ReactionSubmissionResult(
                    reaction =
                        ReactionResponseDto(
                            id = existingReaction.id!!,
                            contentId = createDto.contentId,
                            reactionType = createDto.reactionType,
                            count = newCount,
                        ),
                    operation = ReactionSubmissionResult.Operation.REMOVED,
                )
            }
            else -> {
                logger.info(
                    "Updating reaction {} to {} for user {} on content {}",
                    existingReaction.reactionType,
                    createDto.reactionType,
                    userId,
                    createDto.contentId,
                )
                // Update existing reaction instead of delete + insert to avoid unique constraint violation
                existingReaction.reactionType = createDto.reactionType
                val updatedReaction = reactionRepository.save(existingReaction)

                val newCount =
                    reactionRepository.countByContentIdAndReactionType(
                        createDto.contentId,
                        createDto.reactionType,
                    ).toInt()

                ReactionSubmissionResult(
                    reaction =
                        ReactionResponseDto(
                            id = updatedReaction.id!!,
                            contentId = createDto.contentId,
                            reactionType = createDto.reactionType,
                            count = newCount,
                        ),
                    operation = ReactionSubmissionResult.Operation.UPDATED,
                )
            }
        }

    private fun createOrReplaceReaction(
        userId: UUID,
        createDto: ReactionCreateDto,
        replacing: Boolean,
    ): ReactionSubmissionResult {
        val savedReaction =
            reactionRepository.save(
                Reaction(
                    userId = userId,
                    contentId = createDto.contentId,
                    reactionType = createDto.reactionType,
                ),
            )

        val updatedCount =
            reactionRepository.countByContentIdAndReactionType(
                createDto.contentId,
                createDto.reactionType,
            ).toInt()

        logger.info(
            "Reaction submitted successfully: {} by user {} on content {} (count: {})",
            createDto.reactionType,
            userId,
            createDto.contentId,
            updatedCount,
        )

        val operation =
            if (replacing) {
                ReactionSubmissionResult.Operation.UPDATED
            } else {
                ReactionSubmissionResult.Operation.CREATED
            }

        return ReactionSubmissionResult(
            reaction =
                ReactionResponseDto(
                    id = savedReaction.id!!,
                    contentId = createDto.contentId,
                    reactionType = createDto.reactionType,
                    count = updatedCount,
                ),
            operation = operation,
        )
    }

    /**
     * Removes a user's reaction to content.
     *
     * <p>Used when frontend explicitly requests reaction removal. Also used internally
     * when user clicks same reaction type to toggle it off.</p>
     *
     * @param userId UUID of the authenticated user (from JWT token)
     * @param contentId UUID of the heritage page/content
     * @throws NoSuchElementException if reaction doesn't exist
     */
    @CacheEvict(value = [CACHE_NAME], key = "#contentId")
    fun deleteReaction(
        userId: UUID,
        contentId: UUID,
    ) {
        logger.debug("Deleting reaction for user {} on content {}", userId, contentId)

        val existingReaction =
            reactionRepository.findByUserIdAndContentId(userId, contentId)
                ?: throw ResourceNotFoundException("No reaction found for user $userId on content $contentId")

        reactionRepository.delete(existingReaction)

        logger.info("Reaction deleted successfully for user {} on content {}", userId, contentId)
    }

    /**
     * Gets aggregated reaction counts for a specific content page.
     *
     * <p><strong>Caching</strong>: Results cached for 5 minutes to reduce database load.
     * Cache is invalidated when any user submits/removes a reaction for this content.</p>
     *
     * <p><strong>User Reaction</strong>: If userId is provided (authenticated user),
     * includes the user's current reaction in the response. If userId is null
     * (unauthenticated user), userReaction field is null.</p>
     *
     * @param contentId UUID of the heritage page/content
     * @param userId UUID of the authenticated user (null for unauthenticated)
     * @return ReactionCountsDto with counts map and user's reaction (if any)
     */
    @Transactional(readOnly = true)
    fun getReactionCounts(
        contentId: UUID,
        userId: UUID?,
    ): ReactionCountsDto {
        logger.debug("Fetching reaction counts for content {} (user: {})", contentId, userId)

        val countsMap = getCachedReactionAggregates(contentId)
        val userReaction = userId?.let { reactionRepository.findByUserIdAndContentId(it, contentId)?.reactionType }

        return ReactionCountsDto(
            contentId = contentId,
            reactions = countsMap,
            userReaction = userReaction,
        )
    }

    private fun getCachedReactionAggregates(contentId: UUID): Map<ReactionType, Int> {
        val cache = cacheManager.getCache(CACHE_NAME)

        @Suppress("UNCHECKED_CAST")
        val cached =
            cache?.get(contentId, Map::class.java) as? Map<ReactionType, Int>
        if (cached != null) {
            return cached
        }

        val computed = computeAggregatedCounts(contentId)
        cache?.put(contentId, computed)
        return computed
    }

    @Transactional(readOnly = true)
    private fun computeAggregatedCounts(contentId: UUID): Map<ReactionType, Int> {
        val counts = reactionRepository.getReactionCountsByContentId(contentId)

        if (counts.isEmpty()) {
            return ReactionType.entries.associateWith { 0 }
        }

        val aggregated = counts.associate { it.type to it.count.toInt() }
        return ReactionType.entries.associateWith { type -> aggregated[type] ?: 0 }
    }

    /**
     * Checks if user is within rate limit for reaction submissions.
     *
     * <p><strong>Algorithm</strong>:
     * <ol>
     *   <li>Get user's recent submission timestamps from in-memory cache</li>
     *   <li>Remove timestamps older than 60 seconds (sliding window)</li>
     *   <li>If less than 10 submissions in last minute, allow and record timestamp</li>
     *   <li>Otherwise, deny submission</li>
     * </ol>
     *
     * <p><strong>Thread Safety</strong>: Synchronizes on the submissions deque to ensure
     * atomic check-and-modify operations, preventing race conditions where multiple
     * concurrent requests could bypass the rate limit.</p>
     *
     * <p><strong>Production Note</strong>: This in-memory implementation works for single
     * instances but needs Redis for distributed deployments (multiple backend pods).</p>
     *
     * @param userId UUID of the user to check
     * @return true if within rate limit, false if exceeded
     */
    private fun checkRateLimit(userId: UUID): Boolean {
        val now = Instant.now()
        val windowStart = now.minusSeconds(RATE_LIMIT_WINDOW_SECONDS)

        // Get or create user's submission history
        val submissions = rateLimiter.computeIfAbsent(userId) { ConcurrentLinkedDeque() }

        // CRITICAL: Synchronize entire check-and-modify sequence to prevent race conditions
        synchronized(submissions) {
            // Remove old submissions outside the time window
            submissions.removeIf { it.isBefore(windowStart) }

            // Check if under limit
            if (submissions.size >= MAX_REACTIONS_PER_MINUTE) {
                return false
            }

            // Record this submission
            submissions.add(now)
            return true
        }
    }

    data class ReactionSubmissionResult(
        val reaction: ReactionResponseDto,
        val operation: Operation,
    ) {
        enum class Operation {
            CREATED,
            UPDATED,
            REMOVED,
        }
    }
}
