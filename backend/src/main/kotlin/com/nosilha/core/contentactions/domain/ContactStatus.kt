package com.nosilha.core.contentactions.domain

/**
 * Status enum for contact message tracking workflow.
 *
 * State Transitions:
 * - UNREAD → READ: Admin marks message as read
 * - READ → ARCHIVED: Admin archives message
 * - UNREAD → ARCHIVED: Admin directly archives unread message
 * All transitions are admin-initiated only.
 */
enum class ContactStatus {
    /** New message awaiting review (default) */
    UNREAD,

    /** Message has been viewed by admin */
    READ,

    /** Message has been archived */
    ARCHIVED,
}
