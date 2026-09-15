package com.nosilha.core.places

import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 * Verifies the category guard and completeness reach the API response
 * (spec 033 FR-002, FR-003, FR-007; spec 034 FR-016).
 *
 * <p>[FieldGuardTest] proves the rules in isolation. These assertions prove they
 * survive the mapper and serialization — the guard is only useful if a template
 * genuinely cannot see a field it should not render.</p>
 *
 * <p>Completeness counts the record's field grid: settlement, category and coordinates,
 * the category's eligible fields, and the photographer once a hero exists.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Directory entry guard, end to end")
class DirectoryEntryGuardIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `a heritage record counts its grid rows, not contact fields`() {
        // A public square is not incomplete for lacking a phone number: settlement,
        // category, coordinates, established, status, festival, architect, opening hours.
        mockMvc
            .perform(get("/api/v1/directory/slug/praca-eugenio-tavares"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.completeness.total").value(8))
            .andExpect(jsonPath("$.data.completeness.missingFields[?(@ == 'phoneNumber')]").isEmpty)
    }

    @Test
    fun `accommodation counts its full practical field set`() {
        // The denominator differs by category -- that is the guard working.
        mockMvc
            .perform(get("/api/v1/directory/slug/pousada-nova-sintra"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.category").value("Hotel"))
            .andExpect(jsonPath("$.data.completeness.total").value(9))
    }

    @Test
    fun `a heritage record carrying real contact details still surfaces them`() {
        // casa-eugenio-tavares holds a genuine phone, email and website. The archive
        // has them, so the record shows them -- without Heritage becoming eligible.
        mockMvc
            .perform(get("/api/v1/directory/slug/casa-eugenio-tavares"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.category").value("Heritage"))
            .andExpect(jsonPath("$.data.phoneNumber").value("+238 2623385"))
            .andExpect(jsonPath("$.data.website").value("http://www.eugeniotavares.org"))
            // Display did not widen the denominator: still the eight heritage grid rows.
            .andExpect(jsonPath("$.data.completeness.total").value(8))
    }

    @Test
    fun `no rating is exposed on a non-accommodation record`() {
        mockMvc
            .perform(get("/api/v1/directory/slug/igreja-nossa-senhora-do-monte"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.rating").doesNotExist())
            .andExpect(jsonPath("$.data.reviewCount").value(0))
    }

    @Test
    fun `the church record reads six of nine, as the prototype does`() {
        // Established, status and festival come from the seed; the photograph has no
        // recorded photographer, and opening hours and architect are not recorded.
        mockMvc
            .perform(get("/api/v1/directory/slug/igreja-nossa-senhora-do-monte"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.completeness.documented").value(6))
            .andExpect(jsonPath("$.data.completeness.total").value(9))
            .andExpect(jsonPath("$.data.completeness.missingFields[0]").value("photographer"))
            .andExpect(jsonPath("$.data.completeness.missingFields[1]").value("openingHours"))
            .andExpect(jsonPath("$.data.completeness.missingFields[2]").value("architect"))
    }

    @Test
    fun `records at identical coordinates reference each other`() {
        // Nos Raiz and the Faja d'Agua nature entry carry byte-identical coordinates.
        // The redesign states that duplication rather than hiding it.
        mockMvc
            .perform(get("/api/v1/directory/slug/nos-raiz"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.coincidentWith").exists())
            .andExpect(jsonPath("$.data.coincidentWith.slug").value("faja-dagua"))

        mockMvc
            .perform(get("/api/v1/directory/slug/faja-dagua"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.coincidentWith.slug").value("nos-raiz"))
    }

    @Test
    fun `list views carry completeness but not the coincidence lookup`() {
        // List views would pay a query per row for a note they do not render.
        mockMvc
            .perform(get("/api/v1/directory/entries?size=5"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data[0].completeness").exists())
            .andExpect(jsonPath("$.data[0].coincidentWith").doesNotExist())
    }

    @Test
    fun `entries can be filtered by canonical settlement id`() {
        val townId = mockMvc
            .perform(get("/api/v1/towns/status-summary"))
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString
            .let { Regex("\"id\":\"([0-9a-f-]+)\",\"slug\":\"nova-sintra\"").find(it)?.groupValues?.get(1) }

        requireNotNull(townId) { "nova-sintra should be present in the status summary" }

        mockMvc
            .perform(get("/api/v1/directory/entries?townId=$townId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data[0].townId").value(townId))
    }
}
