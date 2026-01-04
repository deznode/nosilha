package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.StoryService
import com.nosilha.core.contentactions.domain.StoryStatus
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Admin REST controller for managing story submissions.
 *
 * <p>Provides administrative endpoints for moderating community-submitted cultural heritage stories.
 * All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/stories - List stories with optional status filter and pagination</li>
 *   <li>GET /api/v1/admin/stories/{id} - Get single story details</li>
 *   <li>PUT /api/v1/admin/stories/{id} - Update story status (approve/reject/publish)</li>
 *   <li>PATCH /api/v1/admin/stories/{id}/featured - Toggle story featured status</li>
 *   <li>DELETE /api/v1/admin/stories/{id} - Delete a story</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All moderation actions are logged with admin user ID</li>
 *   <li>Story publication events are published for potential email notifications</li>
 * </ul>
 *
 * @property storyService Service for managing story submissions
 */
@RestController
@RequestMapping("/api/v1/admin/stories")
class AdminStoryController(
    private val storyService: StoryService,
) {
    /**
     * Lists stories with optional status filtering and pagination.
     *
     * <p>Supports filtering by story status (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED).
     * Pagination parameters allow for efficient retrieval of large result sets.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by story status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns a paginated list of stories with metadata including total pages and elements.
     * Each story includes essential information for list display: title, author, type, status,
     * featured flag, and creation timestamp.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED, NEEDS_REVISION, PUBLISHED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResponse containing list of StoryListDto with pagination metadata
     */
    @GetMapping
    fun listStories(
        @RequestParam(required = false) status: StoryStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<StoryDetailDto> {
        val result = storyService.listStoriesWithDetails(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific story.
     *
     * <p>Returns complete story data including submitter information, content details, template type
     * (for guided stories), related place association, and any admin review notes. Used for the
     * detailed review view in the admin panel.</p>
     *
     * <h4>Response:</h4>
     * Includes all fields necessary for admin moderation including:
     * <ul>
     *   <li>Full story content and metadata</li>
     *   <li>Story type (QUICK, FULL, or GUIDED) and optional template type</li>
     *   <li>Author ID and optional related place ID</li>
     *   <li>Current moderation status and featured flag</li>
     *   <li>Review history (reviewed by, reviewed at, admin notes)</li>
     *   <li>Publication slug for published stories</li>
     * </ul>
     *
     * @param id UUID of the story to retrieve
     * @return ResponseEntity with ApiResponse containing StoryDetailDto
     * @throws ResourceNotFoundException if story is not found (404 Not Found)
     */
    @GetMapping("/{id}")
    fun getStory(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<StoryDetailDto>> {
        val story = storyService.getStory(id)
        return ResponseEntity.ok(ApiResult(data = story, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a story based on admin moderation action.
     *
     * <p>Allows admins to moderate stories by approving, rejecting, requesting revisions, or publishing them.
     * Optionally includes admin notes for the review decision. The admin's user ID is automatically
     * extracted from the authentication context.</p>
     *
     * <h4>Moderation Actions:</h4>
     * <ul>
     *   <li>APPROVE: Mark story as approved and ready for publication</li>
     *   <li>REJECT: Mark story as rejected and decline publication</li>
     *   <li>REQUEST_REVISION: Request author to revise and resubmit the story</li>
     *   <li>PUBLISH: Publish story and make it publicly visible (requires publication slug)</li>
     * </ul>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Action is required (APPROVE, REJECT, REQUEST_REVISION, or PUBLISH)</li>
     *   <li>Admin notes are optional but limited to 5000 characters</li>
     *   <li>Publication slug is required when action is PUBLISH (max 255 characters)</li>
     * </ul>
     *
     * <h4>Side Effects:</h4>
     * <ul>
     *   <li>Publishes StoryStatusChangedEvent for status changes (APPROVE, REJECT, REQUEST_REVISION)</li>
     *   <li>Publishes StoryPublishedEvent when action is PUBLISH</li>
     *   <li>Records reviewer ID and timestamp</li>
     *   <li>Sets publication slug for published stories</li>
     * </ul>
     *
     * @param id UUID of the story to update
     * @param request Update request containing action, optional admin notes, and optional publication slug
     * @param authentication Spring Security authentication context (provides admin ID)
     * @return ResponseEntity with ApiResponse containing updated StoryDetailDto
     * @throws ResourceNotFoundException if story is not found (404 Not Found)
     * @throws BusinessException if PUBLISH action is used without a publication slug
     */
    @PutMapping("/{id}")
    fun updateStoryStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateStoryStatusRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<StoryDetailDto>> {
        val adminId = authentication.name
        val updated =
            storyService.updateStoryStatus(
                id = id,
                action = request.action,
                notes = request.adminNotes,
                slug = request.publicationSlug,
                adminId = adminId,
            )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Toggles the featured status of a story.
     *
     * <p>Allows admins to mark stories as featured for special display on the frontend.
     * Featured stories can be highlighted in carousels, homepage sections, or special collections
     * to showcase exceptional community contributions.</p>
     *
     * <h4>Use Cases:</h4>
     * <ul>
     *   <li>Highlight particularly well-written or culturally significant stories</li>
     *   <li>Curate featured content for homepage or special sections</li>
     *   <li>Promote stories that exemplify Cape Verdean heritage and morabeza spirit</li>
     * </ul>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Featured status (boolean) is required</li>
     * </ul>
     *
     * @param id UUID of the story to update
     * @param request Toggle request containing the desired featured status
     * @return ResponseEntity with ApiResponse containing updated StoryDetailDto
     * @throws ResourceNotFoundException if story is not found (404 Not Found)
     */
    @PatchMapping("/{id}/featured")
    fun toggleFeatured(
        @PathVariable id: UUID,
        @Valid @RequestBody request: ToggleFeaturedRequest,
    ): ResponseEntity<ApiResult<StoryDetailDto>> {
        val updated = storyService.toggleFeatured(id, request.isFeatured)
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Marks a story as archived to MDX.
     *
     * <p>Creates a bidirectional link between a story submission and its archived MDX file
     * after the MDX has been committed via the AdminMdxController. This endpoint should be
     * called after successfully committing MDX content to track which stories have been
     * archived to the content system.</p>
     *
     * <h4>Workflow:</h4>
     * <ol>
     *   <li>Admin approves and publishes a story via PUT /api/v1/admin/stories/{id}</li>
     *   <li>Admin generates and commits MDX via POST /api/v1/admin/stories/{id}/commit-mdx</li>
     *   <li>Admin marks story as archived via this endpoint with the MDX slug</li>
     * </ol>
     *
     * <h4>Business Rules:</h4>
     * <ul>
     *   <li>Only published stories can be archived</li>
     *   <li>Slug must match the slug used in the MDX archive</li>
     *   <li>Archival status is recorded with admin ID and timestamp</li>
     * </ul>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Slug is required (1-255 characters)</li>
     *   <li>Archived timestamp is optional (defaults to current time)</li>
     * </ul>
     *
     * @param id UUID of the story to mark as archived
     * @param request Archive request containing the MDX slug and optional timestamp
     * @param authentication Spring Security authentication context (provides admin ID)
     * @return ResponseEntity with ApiResult containing updated StoryDetailDto
     * @throws ResourceNotFoundException if story is not found (404 Not Found)
     * @throws BusinessException if story is not in PUBLISHED status
     */
    @PatchMapping("/{id}/archive")
    fun markAsArchived(
        @PathVariable id: UUID,
        @Valid @RequestBody request: MarkArchivedRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<StoryDetailDto>> {
        val adminId = authentication.name
        val updated =
            storyService.markAsArchived(
                id = id,
                slug = request.slug,
                adminId = adminId,
                archivedAt = request.archivedAt,
            )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Deletes a story from the system.
     *
     * <p>Permanently removes a story from the database. This operation should be used sparingly
     * as it breaks the audit trail and removes valuable community contributions. Intended for
     * removing spam, test submissions, or content that violates community guidelines.</p>
     *
     * <h4>Warning:</h4>
     * This is a destructive operation that cannot be undone. Consider rejecting stories with
     * detailed admin notes instead of deleting them to maintain a complete audit trail and
     * provide feedback to community members.
     *
     * <h4>Recommended Usage:</h4>
     * <ul>
     *   <li>Spam submissions</li>
     *   <li>Test data created during development</li>
     *   <li>Content that violates community guidelines or terms of service</li>
     *   <li>Duplicate submissions</li>
     * </ul>
     *
     * @param id UUID of the story to delete
     * @throws ResourceNotFoundException if story is not found (404 Not Found)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteStory(
        @PathVariable id: UUID,
    ) {
        storyService.deleteStory(id)
    }
}
