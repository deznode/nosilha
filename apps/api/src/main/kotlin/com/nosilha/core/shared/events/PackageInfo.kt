package com.nosilha.core.shared.events

import org.springframework.modulith.NamedInterface
import org.springframework.modulith.PackageInfo

/**
 * Shared Events package - Common event models for cross-module communication
 *
 * <p>This package contains shared event models used for inter-module communication.
 * Exposed as a named interface to allow other modules to publish and consume these events.
 *
 * <p><strong>Named Interface: "events"</strong>
 * <ul>
 *   <li>Reference in modules as: allowedDependencies = ["shared :: events"]</li>
 *   <li>Contains: ApplicationModuleEvent (base class), domain event types</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@NamedInterface("events")
class PackageInfo
