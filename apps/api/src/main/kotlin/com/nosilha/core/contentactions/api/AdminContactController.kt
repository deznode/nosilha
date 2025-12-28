package com.nosilha.core.contentactions.api

import com.nosilha.core.contentactions.domain.ContactStatus
import com.nosilha.core.contentactions.services.ContactService
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
 * Admin REST controller for managing contact messages.
 *
 * <p>Provides administrative endpoints for viewing and managing visitor contact form submissions.
 * All endpoints require ADMIN role (configured in SecurityConfig).</p>
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>GET /api/v1/admin/contact - List contact messages with optional status filter and pagination</li>
 *   <li>GET /api/v1/admin/contact/{id} - Get single contact message details</li>
 *   <li>PUT /api/v1/admin/contact/{id} - Update contact message status (mark as read/archived)</li>
 *   <li>DELETE /api/v1/admin/contact/{id} - Delete a contact message</li>
 * </ul>
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>Authentication required: ADMIN role</li>
 *   <li>All actions are logged</li>
 * </ul>
 *
 * @property contactService Service for managing contact messages
 */
@RestController
@RequestMapping("/api/v1/admin/contact")
@Tag(name = "Admin Contact", description = "Admin endpoints for contact message management")
class AdminContactController(
    private val contactService: ContactService,
) {
    /**
     * Lists contact messages with optional status filtering and pagination.
     *
     * <p>Supports filtering by message status (UNREAD, READ, ARCHIVED).
     * Pagination parameters allow for efficient retrieval of large result sets.</p>
     *
     * <h4>Query Parameters:</h4>
     * <ul>
     *   <li>status (optional): Filter by message status</li>
     *   <li>page (default: 0): Zero-based page number</li>
     *   <li>size (default: 20): Number of items per page (max 100)</li>
     * </ul>
     *
     * <h4>Response:</h4>
     * Returns a paginated list of contact messages with metadata including total pages and elements.
     *
     * @param status Optional status filter (UNREAD, READ, ARCHIVED)
     * @param page Zero-based page number (default: 0)
     * @param size Number of items per page (default: 20, max: 100)
     * @return PagedApiResult containing list of AdminContactMessageDto with pagination metadata
     */
    @GetMapping
    @Operation(
        summary = "List contact messages",
        description = "Get paginated list of contact messages with optional status filtering. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Contact messages retrieved successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "401",
                description = "Authentication required",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "403",
                description = "Admin role required",
            ),
        ],
    )
    fun listContactMessages(
        @RequestParam(required = false) status: ContactStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AdminContactMessageDto> {
        val result = contactService.listMessages(status, page, size)
        return PagedApiResult.from(result)
    }

    /**
     * Retrieves detailed information for a specific contact message.
     *
     * <p>Returns complete message data including sender information and content.</p>
     *
     * @param id UUID of the contact message to retrieve
     * @return ResponseEntity with ApiResult containing AdminContactMessageDto
     * @throws ResourceNotFoundException if message is not found (404 Not Found)
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get contact message",
        description = "Get detailed information for a specific contact message. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Contact message retrieved successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                description = "Contact message not found",
            ),
        ],
    )
    fun getContactMessage(
        @PathVariable id: UUID,
    ): ResponseEntity<ApiResult<AdminContactMessageDto>> {
        val message = contactService.getMessage(id)
        return ResponseEntity.ok(ApiResult(data = message, status = HttpStatus.OK.value()))
    }

    /**
     * Updates the status of a contact message.
     *
     * <p>Allows admins to mark messages as READ or ARCHIVED.</p>
     *
     * <h4>State Transitions:</h4>
     * <ul>
     *   <li>UNREAD → READ: Admin marks message as read</li>
     *   <li>READ → ARCHIVED: Admin archives message</li>
     *   <li>UNREAD → ARCHIVED: Admin directly archives unread message</li>
     * </ul>
     *
     * @param id UUID of the contact message to update
     * @param request Update request containing the new status
     * @return ResponseEntity with ApiResult containing updated AdminContactMessageDto
     * @throws ResourceNotFoundException if message is not found (404 Not Found)
     */
    @PutMapping("/{id}")
    @Operation(
        summary = "Update contact message status",
        description = "Update the status of a contact message (mark as read/archived). Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "Contact message updated successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                description = "Contact message not found",
            ),
        ],
    )
    fun updateContactMessageStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateContactStatusRequest,
    ): ResponseEntity<ApiResult<AdminContactMessageDto>> {
        val updated = contactService.updateStatus(id, request.status)
        return ResponseEntity.ok(ApiResult(data = updated, status = HttpStatus.OK.value()))
    }

    /**
     * Deletes a contact message from the system.
     *
     * <p>Permanently removes a message from the database. This operation should be used
     * sparingly as it removes the message permanently.</p>
     *
     * <h4>Warning:</h4>
     * This is a destructive operation that cannot be undone. Consider archiving messages
     * instead of deleting them.
     *
     * @param id UUID of the contact message to delete
     * @throws ResourceNotFoundException if message is not found (404 Not Found)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
        summary = "Delete contact message",
        description = "Permanently delete a contact message. Requires ADMIN role.",
    )
    @ApiResponses(
        value = [
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "204",
                description = "Contact message deleted successfully",
            ),
            io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404",
                description = "Contact message not found",
            ),
        ],
    )
    fun deleteContactMessage(
        @PathVariable id: UUID,
    ) {
        contactService.deleteMessage(id)
    }
}
