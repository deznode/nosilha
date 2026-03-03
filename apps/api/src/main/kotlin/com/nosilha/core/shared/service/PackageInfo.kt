package com.nosilha.core.shared.service

import org.springframework.modulith.NamedInterface
import org.springframework.modulith.PackageInfo

/**
 * Service package containing shared infrastructure services.
 *
 * <p>Exposes infrastructure services used across modules:</p>
 * <ul>
 *   <li>{@link FrontendRevalidationService} - ISR cache revalidation for Next.js</li>
 * </ul>
 *
 * <p><strong>Named Interface: "service"</strong></p>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: service"]</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@NamedInterface("service")
class PackageInfo
