package com.nosilha.core.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(1)
class JwtAuthenticationFilter(
    @Value("\${supabase.jwt-secret}") private val jwtSecret: String,
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
            val key = Keys.hmacShaKeyFor(jwtSecret.toByteArray())
            val claims: Claims =
                Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .payload

            // If the token is valid and user is not yet authenticated
            if (SecurityContextHolder.getContext().authentication == null) {
                // 'sub' claim in a Supabase JWT is the user's UUID
                val userId = claims.subject

                // Extract roles from Supabase JWT - they can be in different places
                val authorities = mutableListOf<SimpleGrantedAuthority>()

                // Add default authenticated role
                authorities.add(SimpleGrantedAuthority("ROLE_authenticated"))

                // Check for role in top-level claims
                val role = claims["role"] as? String
                if (role != null) {
                    authorities.add(SimpleGrantedAuthority("ROLE_$role"))
                }

                // Check for roles in app_metadata (common Supabase pattern)
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

                // Fallback to USER role if no specific role found
                if (authorities.size == 1) { // Only has authenticated role
                    authorities.add(SimpleGrantedAuthority("ROLE_USER"))
                }

                val authentication =
                    UsernamePasswordAuthenticationToken(
                        userId, // Principal is the user's ID
                        null, // Credentials are not needed for JWT
                        authorities,
                    )

                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authentication

                logger.debug("JWT authentication successful for user: $userId with authorities: ${authorities.map { it.authority }}")
            }
        } catch (e: Exception) {
            // If token is invalid (expired, malformed, etc.), do not set authentication
            // and just proceed. The user will be considered unauthenticated.
            logger.warn("JWT token processing error: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }
}
