package com.nosilha.core.stories.domain

/**
 * Type of story submission format.
 */
enum class StoryType {
    /** Brief memory, typically 10-500 characters */
    QUICK,

    /** Complete story, up to 5000 characters */
    FULL,

    /** Template-based with structured prompts */
    GUIDED,
}
