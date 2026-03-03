package com.nosilha.core.shared.api

import org.springframework.modulith.NamedInterface
import org.springframework.modulith.PackageInfo

/**
 * Shared API package - Public API response models and DTOs
 *
 * <p>This package contains shared API response models used across all modules.
 * Exposed as a named interface to allow other modules to depend on these types.
 *
 * <p><strong>Named Interface: "api"</strong>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: api"]</li>
 *   <li>Contains: ApiResult, validation DTOs, common API models</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@NamedInterface("api")
class PackageInfo
