package com.nosilha.core.auth.domain

/**
 * Enum representing supported user interface languages.
 *
 * <p>These language codes follow ISO 639-2/3 standards:</p>
 * <ul>
 *   <li>EN: English (default)</li>
 *   <li>PT: Portuguese</li>
 *   <li>KEA: Kabuverdianu (Cape Verdean Creole)</li>
 * </ul>
 */
enum class PreferredLanguage {
    /** English (default) */
    EN,

    /** Portuguese */
    PT,

    /** Kabuverdianu (Cape Verdean Creole) */
    KEA,
}
