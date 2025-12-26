package com.nosilha.core.auth.domain

/**
 * Data class representing user notification preferences stored as JSONB.
 *
 * <p>This class is serialized to JSON and stored in the user_profiles table
 * notification_preferences column. All fields default to opt-in values
 * to encourage community engagement.</p>
 *
 * <p><strong>Notification Types:</strong></p>
 * <ul>
 *   <li>storyPublished: Notify when user's submitted story is published (default: true)</li>
 *   <li>suggestionApproved: Notify when user's content suggestion is approved (default: true)</li>
 *   <li>weeklyDigest: Receive weekly digest of new heritage content (default: false)</li>
 * </ul>
 */
data class NotificationPreferences(
    /** Notify when user's submitted story is published */
    val storyPublished: Boolean = true,
    /** Notify when user's content suggestion is approved */
    val suggestionApproved: Boolean = true,
    /** Receive weekly digest of new heritage content */
    val weeklyDigest: Boolean = false,
)
