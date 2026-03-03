package com.nosilha.core.feedback

import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * Security integration tests for Admin Moderation and Story Submission APIs.
 *
 * Tests verify:
 * - T032: Admin endpoints return 403 for non-admin users
 * - T033: Story submission returns 401 for unauthenticated users
 * - T034: Endpoints work correctly with proper authentication
 *
 * Uses existing test patterns from MediaUploadIntegrationTest.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AdminModerationSecurityTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    private val testId = UUID.randomUUID()
    private val testUserId = UUID.randomUUID()
    private val testAdminId = UUID.randomUUID()

    /**
     * Creates an authentication with USER role.
     */
    private fun userAuth(userId: UUID = testUserId) =
        authentication(
            UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER")),
            ),
        )

    /**
     * Creates an authentication with ADMIN role.
     */
    private fun adminAuth(userId: UUID = testAdminId) =
        authentication(
            UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    // ========================================================================
    // T032: Admin Endpoints Return 403 for Non-Admin Users
    // ========================================================================

    @Nested
    @DisplayName("T032: Admin Suggestions Endpoints - Non-Admin Access")
    inner class AdminSuggestionsNonAdminTests {
        @Test
        @DisplayName("GET /api/v1/admin/suggestions should return 403 for USER role")
        fun `list suggestions should return 403 for non-admin`() {
            mockMvc
                .perform(get("/api/v1/admin/suggestions").with(userAuth()))
                .andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("GET /api/v1/admin/suggestions/{id} should return 403 for USER role")
        fun `get suggestion should return 403 for non-admin`() {
            mockMvc
                .perform(get("/api/v1/admin/suggestions/$testId").with(userAuth()))
                .andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("PUT /api/v1/admin/suggestions/{id} should return 403 for USER role")
        fun `update suggestion should return 403 for non-admin`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/suggestions/$testId")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"status":"APPROVED"}"""),
                ).andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("DELETE /api/v1/admin/suggestions/{id} should return 403 for USER role")
        fun `delete suggestion should return 403 for non-admin`() {
            mockMvc
                .perform(delete("/api/v1/admin/suggestions/$testId").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("T032: Admin Stories Endpoints - Non-Admin Access")
    inner class AdminStoriesNonAdminTests {
        @Test
        @DisplayName("GET /api/v1/admin/stories should return 403 for USER role")
        fun `list stories should return 403 for non-admin`() {
            mockMvc
                .perform(get("/api/v1/admin/stories").with(userAuth()))
                .andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("GET /api/v1/admin/stories/{id} should return 403 for USER role")
        fun `get story should return 403 for non-admin`() {
            mockMvc
                .perform(get("/api/v1/admin/stories/$testId").with(userAuth()))
                .andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("PUT /api/v1/admin/stories/{id} should return 403 for USER role")
        fun `update story should return 403 for non-admin`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/stories/$testId")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"action":"APPROVE"}"""),
                ).andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("PATCH /api/v1/admin/stories/{id}/featured should return 403 for USER role")
        fun `toggle featured should return 403 for non-admin`() {
            mockMvc
                .perform(
                    patch("/api/v1/admin/stories/$testId/featured")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"isFeatured":true}"""),
                ).andExpect(status().isForbidden)
        }

        @Test
        @DisplayName("DELETE /api/v1/admin/stories/{id} should return 403 for USER role")
        fun `delete story should return 403 for non-admin`() {
            mockMvc
                .perform(delete("/api/v1/admin/stories/$testId").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("T032: Admin Dashboard Endpoints - Non-Admin Access")
    inner class AdminDashboardNonAdminTests {
        @Test
        @DisplayName("GET /api/v1/admin/dashboard/counts should return 403 for USER role")
        fun `dashboard counts should return 403 for non-admin`() {
            mockMvc
                .perform(get("/api/v1/admin/dashboard/counts").with(userAuth()))
                .andExpect(status().isForbidden)
        }
    }

    // ========================================================================
    // T033: Story Submission Returns 401/403 for Unauthenticated Users
    // ========================================================================

    @Nested
    @DisplayName("T033: Story Submission - Unauthenticated Access")
    inner class StorySubmissionUnauthenticatedTests {
        @Test
        @DisplayName("POST /api/v1/stories should be rejected without authentication")
        fun `story submission should be rejected for unauthenticated`() {
            // OAuth2 Resource Server returns 401 Unauthorized for unauthenticated requests
            // to endpoints requiring authentication. This is the correct REST API behavior.
            mockMvc
                .perform(
                    post("/api/v1/stories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                                "title": "Test Story",
                                "storyType": "QUICK",
                                "content": "This is a test story about Cape Verde."
                            }
                            """.trimIndent(),
                        ),
                ).andExpect(status().isUnauthorized)
        }
    }

    // ========================================================================
    // T034: Positive Tests - Verify Proper Auth Works
    // ========================================================================

    @Nested
    @DisplayName("T034: Admin Dashboard - Admin Access (Positive)")
    inner class AdminDashboardAdminTests {
        @Test
        @DisplayName("GET /api/v1/admin/dashboard/counts should return 200 for ADMIN role")
        fun `dashboard counts should return 200 for admin`() {
            mockMvc
                .perform(get("/api/v1/admin/dashboard/counts").with(adminAuth()))
                .andExpect(status().isOk)
        }
    }
}
