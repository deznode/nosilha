package com.nosilha.core.feedback.api

import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.feedback.SuggestionService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.util.extractClientIp
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * REST controller for corrections to existing public gallery media (spec 039).
 *
 * <p>Stored as `CORRECTION` suggestions, reviewed in the existing admin suggestions queue.
 * Unlike the public suggestion form, this endpoint requires authentication: name and email
 * are resolved from the authenticated principal rather than taken from the request body.</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/v1/feedback/media-corrections - Submit a correction</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Requires authentication (USER, ADMIN or authenticated)</li>
 *   <li>Rate limiting: shares the suggestion form's 5-per-hour-per-IP bucket</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/v1/feedback/media-corrections")
class MediaCorrectionController(
    private val suggestionService: SuggestionService,
    private val userProfileQueryService: UserProfileQueryService,
) {
    /**
     * Submits a correction to an existing public gallery media item.
     *
     * <p>The submitter's name is resolved from their profile display name, falling back to
     * the JWT's `user_metadata.full_name` claim, and then to the local part of their email.
     * The submitter's email comes from the JWT's `email` claim.</p>
     *
     * @param request Correction data (mediaId, message)
     * @param authentication Spring Security authentication (Supabase JWT)
     * @param request HTTP request (used to extract IP address for rate limiting)
     * @return ApiResult with SuggestionResponseDto (201 Created)
     * @throws IllegalArgumentException (400) if the authenticated JWT has no email claim
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun submitCorrection(
        @Valid @RequestBody request: MediaCorrectionCreateDto,
        authentication: Authentication,
        httpRequest: HttpServletRequest,
    ): ApiResult<SuggestionResponseDto> {
        val userId = extractUserId(authentication)
        val (name, email) = extractIdentity(authentication, userId)
        val ipAddress = extractClientIp(httpRequest)

        logger.info { "Media correction from user $userId for media ${request.mediaId}" }

        val response = suggestionService.submitMediaCorrection(
            mediaId = request.mediaId,
            message = request.message,
            name = name,
            email = email,
            ipAddress = ipAddress,
        )

        return ApiResult(data = response, status = HttpStatus.CREATED.value())
    }

    /**
     * Extracts user ID from Spring Security authentication.
     *
     * For Supabase JWT authentication via JwtAuthenticationToken, the user ID
     * is stored in the 'name' property (third constructor parameter), not in
     * the principal (which contains the Jwt object itself).
     */
    private fun extractUserId(authentication: Authentication): UUID =
        UUID.fromString(
            authentication.name
                ?: error("Authentication name must be present (user ID)"),
        )

    /**
     * Resolves the submitter's display name and email from the authenticated principal.
     *
     * The email always comes from the JWT's `email` claim — there is nowhere else to get it,
     * since [UserProfile][com.nosilha.core.auth.domain.UserProfile] does not store one. The
     * name prefers the profile's display name (the same source used for public attribution
     * elsewhere in the gallery), then the JWT's `user_metadata.full_name`, then the local
     * part of the email.
     */
    private fun extractIdentity(
        authentication: Authentication,
        userId: UUID,
    ): Pair<String, String> {
        val jwt = authentication.principal as? Jwt
        val email = jwt?.getClaimAsString("email")
            ?: throw IllegalArgumentException("Authenticated user has no email claim")

        @Suppress("UNCHECKED_CAST")
        val fullName = jwt.getClaim<Map<String, Any>>("user_metadata")?.get("full_name") as? String

        // Suggestion.name must be 2..255 characters: skip blank or one-letter candidates
        // (an "a@example.com" local part) and fall back to the whole email.
        val name = sequenceOf(userProfileQueryService.findDisplayName(userId), fullName, email.substringBefore("@"), email)
            .mapNotNull { it?.trim()?.take(MAX_NAME_LENGTH) }
            .firstOrNull { it.length >= MIN_NAME_LENGTH }
            ?: throw IllegalArgumentException("Authenticated user has no usable name or email")

        return name to email
    }

    private companion object {
        const val MIN_NAME_LENGTH = 2
        const val MAX_NAME_LENGTH = 255
    }
}
