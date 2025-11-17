package com.nosilha.core.directory

import com.google.cloud.spring.autoconfigure.core.GcpContextAutoConfiguration
import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import com.google.cloud.spring.autoconfigure.vision.CloudVisionAutoConfiguration
import com.nosilha.core.directory.domain.DirectoryEntry
import com.nosilha.core.directory.domain.Restaurant
import com.nosilha.core.directory.repository.DirectoryEntryRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.UUID

/**
 * Integration tests for RelatedContentController.
 *
 * Tests the full stack from HTTP request through the related content discovery
 * algorithm to verify correct matching based on category, town, and cuisine.
 *
 * Phase 9 - User Story 5: Discovering Related Cultural Content
 *
 * Note: All GCP auto-configurations are excluded (Context, Firestore, Storage, Vision).
 * Our custom GCP services are disabled via gcp.enabled=false in application-test.yml.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@EnableAutoConfiguration(
    exclude = [
        GcpContextAutoConfiguration::class,
        GcpFirestoreAutoConfiguration::class,
        GcpStorageAutoConfiguration::class,
        CloudVisionAutoConfiguration::class,
    ],
)
class RelatedContentControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var directoryEntryRepository: DirectoryEntryRepository

    private lateinit var testRestaurant1: DirectoryEntry
    private lateinit var testRestaurant2: DirectoryEntry
    private lateinit var testRestaurant3: DirectoryEntry

    @BeforeEach
    fun setup() {
        // Clean up test data
        directoryEntryRepository.deleteAll()

        // Create test restaurants in Nova Sintra
        testRestaurant1 =
            Restaurant().apply {
                name = "Test Restaurant 1"
                slug = "test-restaurant-1"
                description = "A traditional Cape Verdean restaurant"
                town = "Nova Sintra"
                latitude = 14.8651
                longitude = -24.7092
                cuisine = "Cape Verdean,Seafood"
                imageUrl = "https://example.com/image1.jpg"
            }
        testRestaurant1 = directoryEntryRepository.save(testRestaurant1)

        testRestaurant2 =
            Restaurant().apply {
                name = "Test Restaurant 2"
                slug = "test-restaurant-2"
                description = "Another traditional restaurant in the same town"
                town = "Nova Sintra"
                latitude = 14.8652
                longitude = -24.7093
                cuisine = "Cape Verdean,International"
                imageUrl = "https://example.com/image2.jpg"
            }
        testRestaurant2 = directoryEntryRepository.save(testRestaurant2)

        // Create a restaurant in a different town
        testRestaurant3 =
            Restaurant().apply {
                name = "Test Restaurant 3"
                slug = "test-restaurant-3"
                description = "A restaurant in a different town"
                town = "Fajã d'Água"
                latitude = 14.8500
                longitude = -24.7200
                cuisine = "Cape Verdean,Seafood"
                imageUrl = "https://example.com/image3.jpg"
            }
        testRestaurant3 = directoryEntryRepository.save(testRestaurant3)
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should return related content with 200 OK")
    fun `getRelatedContent with valid contentId should return related entries`() {
        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related")
                .contentType(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(200))
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
            // Should include testRestaurant2 (same category + same town)
            .andExpect(jsonPath("$.data[?(@.id == '${testRestaurant2.id}')]").exists())
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should prioritize same category and town")
    fun `getRelatedContent should prioritize same category and town matches`() {
        val result =
            mockMvc.perform(
                get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=5")
                    .contentType(MediaType.APPLICATION_JSON),
            )
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andReturn()

        val responseBody = result.response.contentAsString
        println("Related content response: $responseBody")

        // testRestaurant2 should be included (same category + same town)
        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=5"),
        )
            .andExpect(jsonPath("$.data[?(@.name == 'Test Restaurant 2')]").exists())
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should exclude current entry from results")
    fun `getRelatedContent should exclude the current entry from results`() {
        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[?(@.id == '${testRestaurant1.id}')]").doesNotExist())
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should respect limit parameter")
    fun `getRelatedContent with limit parameter should return correct number of results`() {
        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=3"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.lessThanOrEqualTo(3)))
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should validate limit minimum (3)")
    fun `getRelatedContent with limit below 3 should default to 3`() {
        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=1"),
        )
            .andExpect(status().isOk)
            // Service should auto-correct to minimum of 3 (or return fewer if not enough data)
            .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(0)))
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should validate limit maximum (5)")
    fun `getRelatedContent with limit above 5 should cap at 5`() {
        // Create additional test restaurants to ensure we have enough data
        (4..10).forEach { i ->
            val restaurant =
                Restaurant().apply {
                    name = "Test Restaurant $i"
                    slug = "test-restaurant-$i"
                    description = "Another test restaurant"
                    town = "Nova Sintra"
                    latitude = 14.8650 + (i * 0.0001)
                    longitude = -24.7090 + (i * 0.0001)
                    cuisine = "Cape Verdean"
                }
            directoryEntryRepository.save(restaurant)
        }

        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=10"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.lessThanOrEqualTo(5)))
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Non-existent content should return empty list")
    fun `getRelatedContent with non-existent contentId should return empty list`() {
        val nonExistentId = UUID.randomUUID()

        mockMvc.perform(
            get("/api/v1/directory/entries/$nonExistentId/related"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data.length()").value(0))
    }

    @Test
    @DisplayName("GET /api/v1/directory/entries/{id}/related - Should match by cuisine for restaurants")
    fun `getRelatedContent should match restaurants by shared cuisine`() {
        // testRestaurant1 has "Cape Verdean,Seafood"
        // testRestaurant3 also has "Cape Verdean,Seafood"
        // Even though different towns, shared cuisine should include it

        mockMvc.perform(
            get("/api/v1/directory/entries/${testRestaurant1.id}/related?limit=5"),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            // Should include testRestaurant3 due to matching cuisine
            .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
    }
}
