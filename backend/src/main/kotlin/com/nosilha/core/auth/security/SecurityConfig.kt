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
            http.cors { cors ->
                cors.configurationSource {
                    CorsConfiguration()
                        .apply {
                            allowedOriginPatterns = this@SecurityConfig.allowedOrigins
                            allowedMethods =
                                listOf(
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "DELETE",
                                    "OPTIONS",
                                )
                            allowedHeaders = listOf("*")
                            allowCredentials = true
                        }
                }
            }
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
                    // Allow all GET requests to directory and towns
                    .requestMatchers(HttpMethod.GET, "/api/v1/directory/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/towns/**")
                    .permitAll()
                    // Allow public suggestions (community contributions without authentication)
                    .requestMatchers(HttpMethod.POST, "/api/v1/suggestions")
                    .permitAll()
                    // Require authentication for POST/PUT/DELETE operations
                    .requestMatchers(HttpMethod.POST, "/api/v1/media/upload")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory/entries")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/directory/**")
                    .hasAnyRole("USER", "ADMIN", "authenticated")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/directory/**")
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
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter::class.java,
            )

        return http.build()
    }
}
