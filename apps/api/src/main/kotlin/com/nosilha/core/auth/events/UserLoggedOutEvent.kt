package com.nosilha.core.auth.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant

/**
 * Event published when a user logs out from the Nos Ilha platform.
 *
 * <p>This event is triggered when a user explicitly logs out or their session
 * is terminated. Other modules can listen to this event to perform cleanup actions
 * like invalidating caches, logging activity, or updating session analytics.</p>
 *
 * <p><strong>Published by:</strong> Auth module logout endpoint</p>
 *
 * <p><strong>Potential Consumers:</strong></p>
 * <ul>
 *   <li>Analytics module - Track user logout activity and session duration</li>
 *   <li>Audit module - Log logout events for security monitoring</li>
 *   <li>Cache module - Invalidate user-specific cached data</li>
 * </ul>
 *
 * @property userId The unique identifier of the user who logged out (Supabase user ID)
 * @property occurredAt Timestamp when the logout event occurred
 */
data class UserLoggedOutEvent(
    val userId: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
