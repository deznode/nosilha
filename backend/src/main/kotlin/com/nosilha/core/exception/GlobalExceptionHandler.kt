package com.nosilha.core.exception

import com.nosilha.core.dto.ErrorResponse
import com.nosilha.core.dto.ValidationErrorResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.BindException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.servlet.NoHandlerFoundException
import java.time.LocalDateTime

private val logger = KotlinLogging.logger {}

/**
 * Global exception handler that provides consistent error responses across the API.
 * Uses @ControllerAdvice to handle exceptions from all controllers.
 */
@ControllerAdvice
class GlobalExceptionHandler {

    /**
     * Handles ResourceNotFoundException (404 errors).
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Resource not found: ${ex.message}" }

        val errorResponse = ErrorResponse(
            error = "Resource Not Found",
            message = ex.message ?: "The requested resource was not found",
            path = request.requestURI,
            status = HttpStatus.NOT_FOUND.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

    /**
     * Handles validation errors from @Valid annotations (400 errors).
     */
    @ExceptionHandler(MethodArgumentNotValidException::class, BindException::class)
    fun handleValidationErrors(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ValidationErrorResponse> {
        logger.warn { "Validation failed: ${ex.message}" }

        val fieldErrors = when (ex) {
            is MethodArgumentNotValidException -> ex.bindingResult.fieldErrors
            is BindException -> ex.bindingResult.fieldErrors
            else -> emptyList()
        }

        val validationErrors = fieldErrors.map { fieldError ->
            ValidationErrorResponse.FieldError(
                field = fieldError.field,
                rejectedValue = fieldError.rejectedValue,
                message = fieldError.defaultMessage ?: "Invalid value"
            )
        }

        val errorResponse = ValidationErrorResponse(
            error = "Validation failed",
            details = validationErrors,
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * Handles malformed JSON requests (400 errors).
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleMalformedJson(
        ex: HttpMessageNotReadableException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Malformed JSON request: ${ex.message}" }

        val errorResponse = ErrorResponse(
            error = "Bad Request",
            message = "Invalid JSON format in request body",
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * Handles type mismatch errors (400 errors).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatch(
        ex: MethodArgumentTypeMismatchException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Type mismatch error: ${ex.message}" }

        val errorResponse = ErrorResponse(
            error = "Bad Request",
            message = "Invalid parameter type for '${ex.name}': expected ${ex.requiredType?.simpleName}",
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * Handles IllegalArgumentException (400 errors).
     */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(
        ex: IllegalArgumentException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Illegal argument: ${ex.message}" }

        val errorResponse = ErrorResponse(
            error = "Bad Request",
            message = ex.message ?: "Invalid request parameter",
            path = request.requestURI,
            status = HttpStatus.BAD_REQUEST.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    /**
     * Handles 404 Not Found when no handler is found.
     */
    @ExceptionHandler(NoHandlerFoundException::class)
    fun handleNoHandlerFound(
        ex: NoHandlerFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "No handler found for ${ex.httpMethod} ${ex.requestURL}" }

        val errorResponse = ErrorResponse(
            error = "Not Found",
            message = "No endpoint found for ${ex.httpMethod} ${ex.requestURL}",
            path = request.requestURI,
            status = HttpStatus.NOT_FOUND.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

    /**
     * Handles business logic exceptions (422 errors).
     */
    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        ex: BusinessException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.warn { "Business logic error: ${ex.message}" }

        val errorResponse = ErrorResponse(
            error = "Business Rule Violation",
            message = ex.message ?: "A business rule was violated",
            path = request.requestURI,
            status = HttpStatus.UNPROCESSABLE_ENTITY.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
    }

    /**
     * Handles all other unhandled exceptions (500 errors).
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.error(ex) { "Unhandled exception occurred" }

        val errorResponse = ErrorResponse(
            error = "Internal Server Error",
            message = "An unexpected error occurred. Please try again later.",
            path = request.requestURI,
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            timestamp = LocalDateTime.now()
        )

        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

/**
 * Custom exception for business logic violations.
 * Results in HTTP 422 Unprocessable Entity responses.
 */
class BusinessException(message: String) : RuntimeException(message)
