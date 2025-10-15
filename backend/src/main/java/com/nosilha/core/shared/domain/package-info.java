/**
 * Shared Domain package - Common domain models and base entities
 *
 * <p>This package contains shared domain models and base entities used across all modules.
 * Exposed as a named interface to allow other modules to depend on these types.
 *
 * <p><strong>Named Interface: "domain"</strong>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: domain"]</li>
 *   <li>Contains: BaseEntity, value objects, common domain models</li>
 * </ul>
 *
 * @since 1.0
 */
@org.springframework.modulith.NamedInterface("domain")
package com.nosilha.core.shared.domain;
