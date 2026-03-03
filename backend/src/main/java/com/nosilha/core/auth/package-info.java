/**
 * Authentication Module
 *
 * <p>This module manages user authentication, authorization, and session management
 * for the Nos Ilha platform. It provides JWT-based authentication integrated with
 * Supabase Auth.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>JWT token validation and authentication</li>
 *   <li>Security configuration and filters</li>
 *   <li>User session management</li>
 *   <li>Authorization and role-based access control</li>
 * </ul>
 *
 * <p><strong>Public API:</strong></p>
 * <ul>
 *   <li>{@code com.nosilha.core.auth.security.JwtAuthenticationFilter} - JWT validation filter</li>
 *   <li>{@code com.nosilha.core.auth.security.SecurityConfig} - Spring Security configuration</li>
 *   <li>{@code com.nosilha.core.auth.events.UserLoggedInEvent} - Published when user logs in</li>
 *   <li>{@code com.nosilha.core.auth.events.UserLoggedOutEvent} - Published when user logs out</li>
 * </ul>
 *
 * <p><strong>Dependencies:</strong></p>
 * <ul>
 *   <li>{@code shared} - Base events and utilities</li>
 * </ul>
 *
 * <p><strong>Events Published:</strong></p>
 * <ul>
 *   <li>UserLoggedInEvent - When a user successfully authenticates</li>
 *   <li>UserLoggedOutEvent - When a user logs out</li>
 * </ul>
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "Authentication Module",
    allowedDependencies = {"shared"}
)
package com.nosilha.core.auth;
