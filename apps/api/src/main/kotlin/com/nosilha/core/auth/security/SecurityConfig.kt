package com.nosilha.core.auth.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val supabaseJwtConverter: SupabaseJwtAuthenticationConverter,
    @Value("\${app.cors.allowed-origins}")
    private var allowedOrigins: List<String>,
    @Value("\${supabase.project-url}")
    private val supabaseProjectUrl: String,
) {
    /**
     * Custom JwtDecoder that explicitly supports ES256 algorithm for Supabase JWKS.
     * Spring Security defaults to RS256, but Supabase uses ES256 for asymmetric JWT signing.
     * Includes issuer validation to ensure tokens originate from the expected Supabase project.
     */
    @Bean
    fun jwtDecoder(): JwtDecoder {
        val jwksUrl = "$supabaseProjectUrl/auth/v1/.well-known/jwks.json"
        val issuerUri = "$supabaseProjectUrl/auth/v1"

        val jwtDecoder = NimbusJwtDecoder
            .withJwkSetUri(jwksUrl)
            .jwsAlgorithm(SignatureAlgorithm.ES256)
            .build()

        // Add issuer validation to ensure JWTs originate from the expected Supabase project
        jwtDecoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuerUri))

        return jwtDecoder
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        if (allowedOrigins.isNotEmpty()) {
            http.cors { cors -> cors.configurationSource { createCorsConfiguration() } }
        }

        http
            // 1. Disable CSRF for stateless APIs
            .csrf { it.disable() }
            // 2. Define authorization rules for endpoints
            .authorizeHttpRequests { requests ->
                requests
                    // Allow public access to health check endpoints
                    .requestMatchers(
                        "/actuator/health",
                        "/actuator/health/**",
                        "/actuator/info",
                    ).permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**")
                    .permitAll()
                    // Allow all GET requests to directory, towns, and gallery
                    .requestMatchers(HttpMethod.GET, "/api/v1/directory/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/towns/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/gallery")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/gallery/{id}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/gallery/entry/{entryId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/gallery/categories")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/gallery/approved")
                    .permitAll()
                    // Allow public suggestions (community contributions without authentication)
                    .requestMatchers(HttpMethod.POST, "/api/v1/suggestions")
                    .permitAll()
                    // Allow public contact form submissions (anonymous visitors can submit)
                    .requestMatchers(HttpMethod.POST, "/api/v1/contact")
                    .permitAll()
                    // Directory submissions require authentication (both old and new endpoints)
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory-submissions")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory/submissions")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    // Allow public access to reaction counts (GET only, POST/DELETE require auth)
                    .requestMatchers(HttpMethod.GET, "/api/v1/reactions/content/**")
                    .permitAll()
                    // Allow public access to content registration (needed for SSR, idempotent)
                    .requestMatchers(HttpMethod.POST, "/api/v1/content/register")
                    .permitAll()
                    // Allow public access to published stories (GET only)
                    .requestMatchers(HttpMethod.GET, "/api/v1/stories")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/stories/slug/**")
                    .permitAll()
                    // Require authentication for POST/PUT/DELETE operations
                    .requestMatchers(HttpMethod.POST, "/api/v1/gallery/upload/presign")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/gallery/upload/confirm")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/gallery/submit")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory/entries")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/directory/**")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/directory/**")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    // Admin endpoints - require ADMIN role
                    .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")
                    // Story submission - require authentication
                    .requestMatchers(HttpMethod.POST, "/api/v1/stories")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    // User profile endpoints - require authentication
                    .requestMatchers("/api/v1/users/me", "/api/v1/users/me/**")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    // Bookmark endpoints - require authentication
                    .requestMatchers("/api/v1/bookmarks", "/api/v1/bookmarks/**")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    // All other requests require authentication
                    .anyRequest()
                    .authenticated()
            }
            // 3. Set session management to stateless
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            // 4. Enable OAuth2 Resource Server with JWT support (JWKS-based verification)
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(supabaseJwtConverter)
                }
            }
        return http.build()
    }

    private fun createCorsConfiguration() =
        CorsConfiguration().apply {
            allowedOriginPatterns = this@SecurityConfig.allowedOrigins
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        }
}
