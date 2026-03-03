package com.nosilha.core.shared.api

import com.fasterxml.jackson.annotation.JsonFormat
import org.springframework.data.domain.Page
import java.time.LocalDateTime

/**
 * Standard API response wrapper for successful responses.
 * Provides consistent response format across all endpoints.
 *
 * @param T The type of the response data
 * @property data The actual response data
 * @property timestamp When the response was generated
 * @property status HTTP status code
 */
data class ApiResult<T>(
    val data: T,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200,
)

/**
 * Paginated API response wrapper for list endpoints.
 * Follows Spring Data Page structure with data and pagination metadata.
 *
 * @param T The type of the data items
 * @property data List of items for current page
 * @property pageable Pagination metadata
 * @property timestamp When the response was generated
 * @property status HTTP status code
 */
data class PagedApiResult<T : Any>(
    val data: List<T>,
    val pageable: PageableInfo,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200,
) {
    companion object {
        /**
         * Creates a PagedApiResult from a Spring Data Page object.
         */
        fun <T : Any> from(page: Page<T>): PagedApiResult<T> =
            PagedApiResult(
                data = page.content,
                pageable =
                    PageableInfo(
                        page = page.number,
                        size = page.size,
                        totalElements = page.totalElements,
                        totalPages = page.totalPages,
                        first = page.isFirst,
                        last = page.isLast,
                    ),
            )
    }
}

/**
 * Pagination metadata information.
 */
data class PageableInfo(
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val first: Boolean,
    val last: Boolean,
)

/**
 * Standard error response format for all API errors.
 *
 * @property error Brief error description
 * @property message Detailed error message
 * @property timestamp When the error occurred
 * @property path The request path that caused the error
 * @property status HTTP status code
 */
data class ErrorResponse(
    val error: String,
    val message: String,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val path: String? = null,
    val status: Int,
)

/**
 * Validation error response with field-specific error details.
 *
 * @property error Brief error description
 * @property details List of field validation errors
 * @property timestamp When the error occurred
 * @property path The request path that caused the error
 * @property status HTTP status code
 */
data class ValidationErrorResponse(
    val error: String,
    val details: List<FieldError>,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val path: String? = null,
    val status: Int = 400,
) {
    /**
     * Represents a validation error for a specific field.
     */
    data class FieldError(
        val field: String,
        val rejectedValue: Any?,
        val message: String,
    )
}
