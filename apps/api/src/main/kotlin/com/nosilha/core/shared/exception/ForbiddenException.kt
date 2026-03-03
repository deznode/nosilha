package com.nosilha.core.shared.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * An exception that is thrown when access to a resource is forbidden.
 *
 * The @ResponseStatus annotation tells Spring to automatically respond with an
 * HTTP 403 Forbidden status code whenever this exception is thrown from a
 * controller and not otherwise handled.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
class ForbiddenException(
    message: String
) : RuntimeException(message)
