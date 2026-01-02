package com.nosilha.core.shared.util

import org.springframework.modulith.NamedInterface
import org.springframework.modulith.PackageInfo

/**
 * Utility package containing shared helper classes.
 *
 * <p>Exposes utility classes used across all modules:</p>
 * <ul>
 *   <li>{@link ContentSanitizer} - XSS prevention for user-generated content</li>
 * </ul>
 *
 * <p><strong>Named Interface: "util"</strong></p>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: util"]</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@NamedInterface("util")
class PackageInfo
