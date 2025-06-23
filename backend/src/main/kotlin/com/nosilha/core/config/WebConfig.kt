package com.nosilha.core.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 * Configures web-layer beans for the application, such as Cross-Origin Resource Sharing (CORS).
 */
@Configuration
class WebConfig {

  /**
   * Creates a bean that defines global CORS settings for the application.
   * This is necessary to allow the frontend development server to make requests to the API.
   *
   * @return A WebMvcConfigurer with the specified CORS rules.
   */
  @Bean
  @Profile("local")
  fun corsConfigurer(): WebMvcConfigurer {
    return object : WebMvcConfigurer {
      override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**") // Apply CORS rules to all API endpoints
          .allowedOrigins("http://localhost:3000")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true)
      }
    }
  }

  @Bean
  @Profile("prod")
  fun prodCorsConfigurer(): WebMvcConfigurer {
    return object : WebMvcConfigurer {
      override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**") // Apply CORS rules to all API endpoints
          .allowedOrigins("https://nosilha-frontend-fgvp3vntma-ue.a.run.app")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true)
      }
    }
  }
}