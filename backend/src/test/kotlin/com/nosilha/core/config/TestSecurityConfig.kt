package com.nosilha.core.config

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec

/**
 * Test security configuration that replaces the production SecurityConfig for tests.
 *
 * This configuration:
 * 1. Removes the custom JwtAuthenticationFilter to allow Spring Security Test mocks to work
 * 2. Configures OAuth2 Resource Server with JWT decoder for test compatibility
 * 3. Maintains the same authorization rules as production
 */
@TestConfiguration
@EnableWebSecurity
@Profile("test")
class TestSecurityConfig {
    @Bean
    @Primary
    fun testSecurityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Disable CSRF for stateless APIs
            .csrf { it.disable() }
            // Configure OAuth2 Resource Server with JWT for testing
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                }
            }
            // Define authorization rules (same as production)
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
                    // Allow public suggestions
                    .requestMatchers(HttpMethod.POST, "/api/v1/suggestions")
                    .permitAll()
                    // Allow public access to reaction counts (GET only)
                    .requestMatchers(HttpMethod.GET, "/api/v1/reactions/content/**")
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
            // Set session management to stateless
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            // Enable CORS with test configuration
            .cors { cors ->
                cors.configurationSource {
                    CorsConfiguration().apply {
                        allowedOriginPatterns = listOf("http://localhost:3000")
                        allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        allowedHeaders = listOf("*")
                        allowCredentials = true
                    }
                }
            }

        return http.build()
    }

    /**
     * JWT decoder bean for tests.
     * This allows Spring Security Test's jwt() mock to work properly.
     */
    @Bean
    @Primary
    fun jwtDecoder(): JwtDecoder {
        val secret = "test-secret-key-that-is-at-least-32-characters-long"
        val secretKey: SecretKey = SecretKeySpec(secret.toByteArray(), "HmacSHA256")
        return NimbusJwtDecoder.withSecretKey(secretKey).build()
    }

    /**
     * JWT authentication converter for tests.
     * Converts JWT to Authentication with the subject (user ID) as the principal name.
     * This matches the production behavior where the principal is a string user ID.
     */
    @Bean
    fun jwtAuthenticationConverter(): org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter {
        val converter = org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter()
        // Set principal claim name to "sub" (subject) which contains the user ID
        converter.setPrincipalClaimName("sub")
        return converter
    }
}
