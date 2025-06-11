package com.nosilha.core.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * An exception that is thrown when a requested resource cannot be found.
 *
 * The @ResponseStatus annotation tells Spring to automatically respond with an
 * HTTP 404 Not Found status code whenever this exception is thrown from a
 * controller and not otherwise handled.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ResourceNotFoundException(message: String) : RuntimeException(message)