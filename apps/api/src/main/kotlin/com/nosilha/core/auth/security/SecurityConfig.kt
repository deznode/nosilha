package com.nosilha.core.auth.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthFilter: JwtAuthenticationFilter,
    @Value("\${app.cors.allowed-origins}")
    private var allowedOrigins: List<String>,
) {
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
                    // Allow all GET requests to directory, towns, media, and curated media
                    .requestMatchers(HttpMethod.GET, "/api/v1/directory/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/towns/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/media/{id}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/media/entry/{entryId}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/curated-media/**")
                    .permitAll()
                    // Allow public suggestions (community contributions without authentication)
                    .requestMatchers(HttpMethod.POST, "/api/v1/suggestions")
                    .permitAll()
                    // Allow public contact form submissions (anonymous visitors can submit)
                    .requestMatchers(HttpMethod.POST, "/api/v1/contact")
                    .permitAll()
                    // Allow public directory submissions (community contributions, rate limited)
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory-submissions")
                    .permitAll()
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
                    .requestMatchers(HttpMethod.POST, "/api/v1/media/presign")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/media/confirm")
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
            // 4. Add the custom JWT filter before the standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }

    private fun createCorsConfiguration() =
        CorsConfiguration().apply {
            allowedOriginPatterns = this@SecurityConfig.allowedOrigins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        }
}
