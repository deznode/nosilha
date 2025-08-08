package com.nosilha.core.config

import com.nosilha.core.security.JwtAuthenticationFilter
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
                            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
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
            .authorizeHttpRequests {
                // Allow public access to health check endpoints
                it
                    .requestMatchers(HttpMethod.GET, "/actuator/health/**")
                    .permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/directory/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/towns/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/media/upload")
                    .hasRole("authenticated")
                    // Only allow authenticated users to create new directory entries
                    .requestMatchers(HttpMethod.POST, "/api/v1/directory/entries")
                    .hasRole("authenticated")
                    // All other requests must be authenticated
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
}
