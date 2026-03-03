package com.nosilha.core.auth.security

import com.nosilha.core.auth.UserSyncService
import com.nosilha.core.auth.events.UserLoggedInEvent
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Converts Supabase JWTs (verified via JWKS) to Spring Security authentication tokens.
 *
 * This converter:
 * 1. Extracts user roles from Supabase JWT claims (role, app_metadata.role, app_metadata.roles)
 * 2. Performs JIT (Just-In-Time) user provisioning to sync users to local database
 * 3. Publishes UserLoggedInEvent for cross-module communication
 *
 * Replaces the previous JwtAuthenticationFilter that used symmetric HMAC verification.
 * Now uses Spring Security OAuth2 Resource Server with asymmetric JWKS verification (ES256).
 */
@Component
class SupabaseJwtAuthenticationConverter(
    private val eventPublisher: ApplicationEventPublisher,
    private val userSyncService: UserSyncService,
) : Converter<Jwt, AbstractAuthenticationToken> {
    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val userId = jwt.subject
        val authorities = extractAuthorities(jwt)

        logger.debug {
            "JWT authentication successful for user: $userId with authorities: ${authorities.map { it.authority }}"
        }

        // JIT User Provisioning: Ensure user exists in local database
        syncUserToLocalDatabase(jwt, userId)

        // Publish UserLoggedInEvent for other modules to react
        eventPublisher.publishEvent(UserLoggedInEvent(userId = userId))

        return JwtAuthenticationToken(jwt, authorities, userId)
    }

    /**
     * Synchronizes the authenticated user to the local database.
     *
     * Implements Just-in-Time (JIT) user provisioning by extracting user information
     * from JWT claims and ensuring a corresponding record exists in the `users` table.
     * This is necessary because other tables (e.g., media.reviewed_by) have foreign key
     * references to the users table.
     *
     * If sync fails, authentication proceeds but a warning is logged. This ensures
     * that temporary database issues don't block authentication entirely.
     */
    private fun syncUserToLocalDatabase(
        jwt: Jwt,
        userId: String,
    ) {
        try {
            val userUuid = UUID.fromString(userId)
            val email = jwt.getClaimAsString("email")

            if (email == null) {
                logger.warn { "Cannot sync user to local DB: email claim missing for user $userId" }
                return
            }

            // Extract optional fields
            @Suppress("UNCHECKED_CAST")
            val appMetadata = jwt.getClaim<Map<String, Any>>("app_metadata")
            val directRole = jwt.getClaimAsString("role")
            val fullName = jwt.getClaim<Map<String, Any>>("user_metadata")?.get("full_name") as? String

            // Determine role from claims
            val role = userSyncService.determineRole(appMetadata, directRole)

            // Ensure user exists in local database (JIT provisioning)
            userSyncService.ensureUserExists(
                userId = userUuid,
                email = email,
                fullName = fullName,
                role = role,
            )
        } catch (e: IllegalArgumentException) {
            logger.warn { "Cannot sync user to local DB: invalid UUID format for user $userId" }
        } catch (e: Exception) {
            // Log but don't fail authentication - user sync is best-effort
            logger.error(e) { "Failed to sync user to local database: userId=$userId" }
        }
    }

    private fun extractAuthorities(jwt: Jwt): List<SimpleGrantedAuthority> {
        val authorities = mutableListOf<SimpleGrantedAuthority>()

        // Add default authenticated role
        authorities.add(SimpleGrantedAuthority("ROLE_authenticated"))

        // Check for role in top-level claims
        val role = jwt.getClaimAsString("role")
        if (role != null) {
            authorities.add(SimpleGrantedAuthority("ROLE_$role"))
        }

        // Check for roles in app_metadata (common Supabase pattern)
        extractAppMetadataRoles(jwt, authorities)

        // Fallback to USER role if no specific role found
        if (authorities.size == 1) { // Only has authenticated role
            authorities.add(SimpleGrantedAuthority("ROLE_USER"))
        }

        return authorities
    }

    private fun extractAppMetadataRoles(
        jwt: Jwt,
        authorities: MutableList<SimpleGrantedAuthority>,
    ) {
        @Suppress("UNCHECKED_CAST")
        val appMetadata = jwt.getClaim<Map<String, Any>>("app_metadata")
        if (appMetadata != null) {
            val appRole = appMetadata["role"] as? String
            if (appRole != null) {
                authorities.add(SimpleGrantedAuthority("ROLE_$appRole"))
            }

            @Suppress("UNCHECKED_CAST")
            val roles = appMetadata["roles"] as? List<String>
            roles?.forEach { r ->
                authorities.add(SimpleGrantedAuthority("ROLE_$r"))
            }
        }
    }
}
