package com.nosilha.core.feedback.api

import com.nosilha.core.feedback.SuggestionService
import com.nosilha.core.feedback.domain.SuggestionStatus
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * Admin REST controller for managing suggestions.
 *
 * <p>Provides administrative endpoints for moderating community content improvement suggestions.
 * All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/suggestions - List suggestions with optional status filter and pagination</li>
 *   <li>GET /api/v1/admin/suggestions/{id} - Get single suggestion details</li>
 *   <li>PUT /api/v1/admin/suggestions/{id} - Update suggestion status (approve/reject)</li>
 *   <li>DELETE /api/v1/admin/suggestions/{id} - Delete a suggestion</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All actions are logged with admin user ID</li>
 * </ul>
 *
 * @property suggestionService Service for managing suggestions
 */
@RestController
@RequestMapping("/api/v1/admin/suggestions")
class AdminSuggestionController(
    private val suggestionService: SuggestionService,
) {
    /**
     * Lists suggestions with optional status filtering and pagination.
     *
     * <p>Supports filtering by suggestion status (PENDING, APPROVED, REJECTED).
     * Pagination parameters allow for efficient retrieval of large result sets.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by suggestion status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns a paginated list of suggestions with metadata including total pages and elements.
     *
     * @param status Optional status filter (PENDING, APPROVED, REJECTED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResponse containing list of SuggestionListDto with pagination metadata
     */
    @GetMapping
    fun listSuggestions(
        @RequestParam(required = false) status: SuggestionStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<SuggestionDetailDto> {
        val result = suggestionService.listSuggestionsWithDetails(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific suggestion.
     *
     * <p>Returns complete suggestion data including submitter information, content details,
     * and any admin review notes. Used for the detailed review view in the admin panel.</p>
     *
     * @param id UUID of the suggestion to retrieve
     * @return ResponseEntity with ApiResponse containing SuggestionDetailDto
     * @throws ResourceNotFoundException if suggestion is not found (404 Not Found)
     */
    @GetMapping("/{id}")
    fun getSuggestion(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<SuggestionDetailDto>> {
        val suggestion = suggestionService.getSuggestion(id)
        return ResponseEntity.ok(ApiResult(data = suggestion, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a suggestion (approve or reject).
     *
     * <p>Allows admins to moderate suggestions by approving or rejecting them.
     * Optionally includes admin notes for the review decision. The admin's user ID
     * is automatically extracted from the authentication context.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>Action is required (APPROVE or REJECT)</li>
     *   <li>Admin notes are optional but limited to 5000 characters</li>
     * </ul>
     *
     * <h4>Side Effects:</h4>
     * <ul>
     *   <li>Publishes SuggestionStatusChangedEvent for potential email notifications</li>
     *   <li>Records reviewer ID and timestamp</li>
     * </ul>
     *
     * @param id UUID of the suggestion to update
     * @param request Update request containing action and optional admin notes
     * @param authentication Spring Security authentication context (provides admin ID)
     * @return ResponseEntity with ApiResponse containing updated SuggestionDetailDto
     * @throws ResourceNotFoundException if suggestion is not found (404 Not Found)
     */
    @PutMapping("/{id}")
    fun updateSuggestionStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateSuggestionStatusRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<SuggestionDetailDto>> {
        val adminId = authentication.name
        val updated =
            suggestionService.updateSuggestionStatus(
                id = id,
                action = request.action,
                notes = request.adminNotes,
                adminId = adminId,
            )
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Deletes a suggestion from the system.
     *
     * <p>Permanently removes a suggestion from the database. This operation should be used
     * sparingly as it breaks the audit trail. Intended for removing spam or invalid submissions.</p>
     *
     * <h4>Warning:</h4>
     * This is a destructive operation that cannot be undone. Consider rejecting suggestions
     * instead of deleting them to maintain a complete audit trail.
     *
     * @param id UUID of the suggestion to delete
     * @throws ResourceNotFoundException if suggestion is not found (404 Not Found)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteSuggestion(
        @PathVariable id: UUID,
    ) {
        suggestionService.deleteSuggestion(id)
    }
}
