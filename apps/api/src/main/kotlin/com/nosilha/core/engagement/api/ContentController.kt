package com.nosilha.core.engagement.api

import com.nosilha.core.engagement.domain.ContentType
import com.nosilha.core.engagement.services.ContentService
import com.nosilha.core.shared.api.ApiResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for content registration.
 *
 * <p>Provides endpoints for registering content to obtain stable IDs for
 * reaction tracking. Called during SSR when rendering ContentActionToolbar.</p>
 */
@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content", description = "Content registration for reaction tracking")
class ContentController(
    private val contentService: ContentService,
) {
    /**
     * Registers content and returns its ID.
     *
     * <p>If the content already exists, returns the existing ID.
     * Otherwise, creates a new entry and returns the new ID.</p>
     *
     * @param request Content registration request
     * @return Content ID response
     */
    @PostMapping("/register")
    @Operation(
        summary = "Register content",
        description = "Registers content to obtain a stable ID for reaction tracking. " +
            "Returns existing ID if already registered.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Content registered successfully",
                content = [Content(schema = Schema(implementation = ContentIdResponse::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters",
            ),
        ],
    )
    fun registerContent(
        @Valid @RequestBody request: ContentRegistrationRequest,
    ): ApiResult<ContentIdResponse> {
        val contentType = ContentType.valueOf(request.type.uppercase())
        val contentId = contentService.registerContent(request.slug, contentType)
        return ApiResult(data = ContentIdResponse(contentId = contentId))
    }
}

/**
 * Request body for content registration.
 */
data class ContentRegistrationRequest(
    @field:NotBlank(message = "Slug is required")
    @field:Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters")
    @field:Pattern(
        regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        message = "Slug must be lowercase alphanumeric with hyphens",
    )
    @Schema(
        description = "URL-safe identifier for the content",
        example = "morna-music-history",
    )
    val slug: String,
    @field:NotBlank(message = "Type is required")
    @field:Pattern(
        regexp = "^(article|page|directory_entry)$",
        flags = [Pattern.Flag.CASE_INSENSITIVE],
        message = "Type must be one of: article, page, directory_entry",
    )
    @Schema(
        description = "Type of content",
        example = "article",
        allowableValues = ["article", "page", "directory_entry"],
    )
    val type: String,
)

/**
 * Response body for content registration.
 */
data class ContentIdResponse(
    @Schema(
        description = "UUID of the registered content",
        example = "550e8400-e29b-41d4-a716-446655440000",
    )
    val contentId: UUID,
)
