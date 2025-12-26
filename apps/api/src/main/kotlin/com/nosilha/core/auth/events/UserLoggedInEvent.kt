package com.nosilha.core.auth.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant

/**
 * Event published when a user successfully logs in to the Nos Ilha platform.
 *
 * <p>This event is triggered when a user's JWT token is validated and they are
 * authenticated. Other modules can listen to this event to perform actions like
 * logging user activity, updating analytics, or initializing user-specific data.</p>
 *
 * <p><strong>Published by:</strong> {@code JwtAuthenticationFilter} in the Auth module</p>
 *
 * <p><strong>Potential Consumers:</strong></p>
 * <ul>
 *   <li>Analytics module - Track user login activity</li>
 *   <li>Audit module - Log authentication events for security</li>
 *   <li>Notification module - Send welcome notifications</li>
 * </ul>
 *
 * @property userId The unique identifier of the authenticated user (Supabase user ID)
 * @property occurredAt Timestamp when the login event occurred
 */
data class UserLoggedInEvent(
    val userId: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
