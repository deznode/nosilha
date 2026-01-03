package com.nosilha.core.auth.security

import com.nosilha.core.auth.UserSyncService
import com.nosilha.core.auth.events.UserLoggedInEvent
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEventPublisher
import org.springframework.core.annotation.Order
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
@Order(1)
class JwtAuthenticationFilter(
    @Value("\${supabase.jwt-secret}") private val jwtSecret: String,
    private val eventPublisher: ApplicationEventPublisher,
    private val userSyncService: UserSyncService,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authHeader: String? = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.substring(7)

        try {
            val claims = parseJwtToken(token)
            authenticateUser(claims, request)
        } catch (e: Exception) {
            // If token is invalid (expired, malformed, etc.), do not set authentication
            // and just proceed. The user will be considered unauthenticated.
            logger.warn("JWT token processing error: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }

    private fun parseJwtToken(token: String): Claims {
        val key = Keys.hmacShaKeyFor(jwtSecret.toByteArray())
        return Jwts
            .parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun authenticateUser(
        claims: Claims,
        request: HttpServletRequest,
    ) {
        // If the token is valid and user is not yet authenticated
        if (SecurityContextHolder.getContext().authentication == null) {
            val userId = claims.subject ?: return // Skip authentication if no subject
            val authorities = extractAuthorities(claims)
            val authentication = createAuthentication(userId, authorities, request)
            SecurityContextHolder.getContext().authentication = authentication

            logger.debug(
                "JWT authentication successful for user: $userId " +
                    "with authorities: ${authorities.map { it.authority }}",
            )

            // JIT User Provisioning: Ensure user exists in local database
            syncUserToLocalDatabase(claims, userId)

            // Publish UserLoggedInEvent for other modules to react
            eventPublisher.publishEvent(UserLoggedInEvent(userId = userId))
        }
    }

    /**
     * Synchronizes the authenticated user to the local database.
     *
     * <p>Implements Just-in-Time (JIT) user provisioning by extracting user information
     * from JWT claims and ensuring a corresponding record exists in the `users` table.
     * This is necessary because other tables (e.g., media.reviewed_by) have foreign key
     * references to the users table.</p>
     *
     * <p>If sync fails, authentication proceeds but a warning is logged. This ensures
     * that temporary database issues don't block authentication entirely.</p>
     *
     * @param claims JWT claims containing user information
     * @param userId User ID from JWT subject claim
     */
    private fun syncUserToLocalDatabase(
        claims: Claims,
        userId: String,
    ) {
        try {
            val userUuid = UUID.fromString(userId)
            val email = claims["email"] as? String

            if (email == null) {
                logger.warn("Cannot sync user to local DB: email claim missing for user $userId")
                return
            }

            // Extract optional fields
            @Suppress("UNCHECKED_CAST")
            val appMetadata = claims["app_metadata"] as? Map<String, Any>
            val directRole = claims["role"] as? String
            val fullName = claims["user_metadata"]?.let { metadata ->
                @Suppress("UNCHECKED_CAST")
                (metadata as? Map<String, Any>)?.get("full_name") as? String
            }

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
            logger.warn("Cannot sync user to local DB: invalid UUID format for user $userId")
        } catch (e: Exception) {
            // Log but don't fail authentication - user sync is best-effort
            logger.error("Failed to sync user to local database: userId=$userId", e)
        }
    }

    private fun extractAuthorities(claims: Claims): List<SimpleGrantedAuthority> {
        val authorities = mutableListOf<SimpleGrantedAuthority>()

        // Add default authenticated role
        authorities.add(SimpleGrantedAuthority("ROLE_authenticated"))

        // Check for role in top-level claims
        val role = claims["role"] as? String
        if (role != null) {
            authorities.add(SimpleGrantedAuthority("ROLE_$role"))
        }

        // Check for roles in app_metadata (common Supabase pattern)
        extractAppMetadataRoles(claims, authorities)

        // Fallback to USER role if no specific role found
        if (authorities.size == 1) { // Only has authenticated role
            authorities.add(SimpleGrantedAuthority("ROLE_USER"))
        }

        return authorities
    }

    private fun extractAppMetadataRoles(
        claims: Claims,
        authorities: MutableList<SimpleGrantedAuthority>,
    ) {
        @Suppress("UNCHECKED_CAST")
        val appMetadata = claims["app_metadata"] as? Map<String, Any>
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

    private fun createAuthentication(
        userId: String,
        authorities: List<SimpleGrantedAuthority>,
        request: HttpServletRequest,
    ): UsernamePasswordAuthenticationToken {
        val authentication =
            UsernamePasswordAuthenticationToken(
                userId, // Principal is the user's ID
                null, // Credentials are not needed for JWT
                authorities,
            )
        authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
        return authentication
    }
}
