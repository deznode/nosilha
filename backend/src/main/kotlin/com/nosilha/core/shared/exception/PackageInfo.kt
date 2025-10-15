package com.nosilha.core.shared.exception

import org.springframework.modulith.NamedInterface
import org.springframework.modulith.PackageInfo

/**
 * Shared Exception package - Common exception types and error handling
 *
 * <p>This package contains shared exception types used across all modules.
 * Exposed as a named interface to allow other modules to depend on these exception types.
 *
 * <p><strong>Named Interface: "exception"</strong>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: exception"]</li>
 *   <li>Contains: Base exceptions, custom exception types, error models</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@NamedInterface("exception")
class PackageInfo
