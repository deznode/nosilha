package com.nosilha.core.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
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

                // NOTE: Supabase roles are often in a namespaced 'app_metadata' claim,
                // but can be customized. We assume a simple 'role' claim here.
                val role = claims["role"] as? String ?: "USER"
                val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))

                val authentication =
                    UsernamePasswordAuthenticationToken(
                        userId, // Principal is the user's ID
                        null, // Credentials are not needed for JWT
                        authorities,
                    )

                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            // If token is invalid (expired, malformed, etc.), do not set authentication
            // and just proceed. The user will be considered unauthenticated.
            logger.warn("JWT token processing error: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }
}
