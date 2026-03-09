package com.nosilha.core.gallery

import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import org.springframework.http.MediaType as HttpMediaType

/**
 * Tests YouTube sync endpoint behavior when the feature is disabled.
 *
 * Separate test class required because {@code youtube.sync.enabled} is set
 * via {@code @SpringBootTest(properties)} which applies at class level.
 */
@ActiveProfiles("test")
@SpringBootTest(properties = ["youtube.sync.enabled=false"])
@AutoConfigureMockMvc
class YouTubeSyncDisabledTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    private val testAdminId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                testAdminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    @Test
    @DisplayName("POST /youtube/sync - Returns 503 when sync is disabled")
    fun `syncEndpoint should return 503 when feature is disabled`() {
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/youtube/sync")
                    .with(adminAuth())
                    .contentType(HttpMediaType.APPLICATION_JSON),
            ).andExpect(status().isServiceUnavailable)
            .andExpect(jsonPath("$.error").value("Service Unavailable"))
            .andExpect(jsonPath("$.message").value("YouTube sync is not enabled. Set youtube.sync.enabled=true to activate."))
    }
}
