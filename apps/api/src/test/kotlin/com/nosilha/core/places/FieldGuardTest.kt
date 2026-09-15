package com.nosilha.core.places

import com.nosilha.core.places.domain.Beach
import com.nosilha.core.places.domain.Church
import com.nosilha.core.places.domain.DirectoryEntry
import com.nosilha.core.places.domain.Heritage
import com.nosilha.core.places.domain.HeroFacts
import com.nosilha.core.places.domain.Hotel
import com.nosilha.core.places.domain.Nature
import com.nosilha.core.places.domain.Port
import com.nosilha.core.places.domain.PracticalField
import com.nosilha.core.places.domain.Restaurant
import com.nosilha.core.places.domain.Trail
import com.nosilha.core.places.domain.Viewpoint
import com.nosilha.core.places.domain.completeness
import com.nosilha.core.places.domain.guardedRating
import com.nosilha.core.places.domain.shows
import com.nosilha.core.places.domain.supports
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * Unit tests for the category guard and derived completeness (spec 033 FR-002/FR-003,
 * spec 034 FR-016).
 *
 * Pure — no Spring context. The guard is the one thing standing between the shared
 * single-table schema and a church with a star rating, so it is worth a full truth
 * table rather than spot checks.
 */
@DisplayName("FieldGuard")
class FieldGuardTest {
    private fun entry(
        e: DirectoryEntry,
        name: String = "Test"
    ): DirectoryEntry =
        e.apply {
            this.name = name
            this.slug = name.lowercase().replace(' ', '-')
            this.description = "A description."
            this.town = "Nova Sintra"
            this.latitude = 14.87
            this.longitude = -24.69
        }

    private fun allCategories(): List<DirectoryEntry> =
        listOf(Restaurant(), Hotel(), Beach(), Heritage(), Nature(), Viewpoint(), Trail(), Church(), Port())
            .map { entry(it) }

    private val heritageFields = listOf(
        PracticalField.ESTABLISHED,
        PracticalField.CONDITION_STATUS,
        PracticalField.FESTIVAL,
        PracticalField.ARCHITECT,
    )

    @Nested
    @DisplayName("eligibility (drives the completeness denominator)")
    inner class Eligibility {
        @Test
        fun `only accommodation is eligible for a rating`() {
            allCategories().forEach {
                assertThat(it.supports(PracticalField.RATING))
                    .describedAs("${it::class.simpleName} rating")
                    .isEqualTo(it is Hotel)
            }
        }

        @Test
        fun `only accommodation and dining are eligible for contact`() {
            allCategories().forEach {
                assertThat(it.supports(PracticalField.CONTACT))
                    .describedAs("${it::class.simpleName} contact")
                    .isEqualTo(it is Hotel || it is Restaurant)
            }
        }

        @Test
        fun `accommodation, dining, heritage and churches are eligible for opening hours`() {
            allCategories().forEach {
                assertThat(it.supports(PracticalField.OPENING_HOURS))
                    .describedAs("${it::class.simpleName} opening hours")
                    .isEqualTo(it is Hotel || it is Restaurant || it is Heritage || it is Church)
            }
        }

        @Test
        fun `cuisine is dining only and amenities are accommodation only`() {
            allCategories().forEach {
                assertThat(it.supports(PracticalField.CUISINE)).isEqualTo(it is Restaurant)
                assertThat(it.supports(PracticalField.AMENITIES)).isEqualTo(it is Hotel)
            }
        }

        @Test
        fun `only heritage and churches are eligible for the heritage fields`() {
            allCategories().forEach { e ->
                heritageFields.forEach { field ->
                    assertThat(e.supports(field))
                        .describedAs("${e::class.simpleName} $field")
                        .isEqualTo(e is Heritage || e is Church)
                }
            }
        }
    }

    @Nested
    @DisplayName("display (eligible, or a value already exists)")
    inner class Display {
        @Test
        fun `a heritage record carrying real contact details still shows them`() {
            // casa-eugenio-tavares is a Heritage record with a genuine phone, email,
            // website and opening hours. The archive holds them, so the record shows
            // them -- without Heritage becoming contact-eligible.
            val casa = entry(Heritage(), "Casa Eugenio Tavares").apply {
                phoneNumber = "+238 2623385"
                email = "nospatrimonio@gmail.com"
                website = "http://www.eugeniotavares.org"
                openingHours = "Mon-Fri 08:00-13:00, 14:00-16:00; Sat-Sun by appointment"
            }
            assertThat(casa.shows(PracticalField.CONTACT)).isTrue()
            assertThat(casa.shows(PracticalField.OPENING_HOURS)).isTrue()
            assertThat(casa.supports(PracticalField.CONTACT)).isFalse()
        }

        @Test
        fun `a heritage record with no contact details shows none`() {
            // praca-eugenio-tavares is a public square. It has no phone, and asking it
            // for one would be the bug this guard exists to prevent.
            val praca = entry(Heritage(), "Praca Eugenio Tavares")
            assertThat(praca.shows(PracticalField.CONTACT)).isFalse()
        }

        @Test
        fun `a heritage record shows its heritage fields even when they are empty`() {
            // Eligible fields render as "not recorded" with a question, so they show.
            val igreja = entry(Heritage(), "Igreja Nossa Senhora do Monte")
            heritageFields.forEach { assertThat(igreja.shows(it)).describedAs("$it").isTrue() }
        }

        @Test
        fun `a non-heritage record holding a heritage value still shows it`() {
            val bay = entry(Nature(), "Faja d'Agua").apply { established = "18th century" }
            assertThat(bay.supports(PracticalField.ESTABLISHED)).isFalse()
            assertThat(bay.shows(PracticalField.ESTABLISHED)).isTrue()
            assertThat(bay.shows(PracticalField.ARCHITECT)).isFalse()
        }

        @Test
        fun `a stray rating on a non-accommodation record is never surfaced`() {
            // RATING has no value-exists escape hatch: accommodation is the only surface
            // that renders one, even if stray data exists.
            listOf(entry(Church()), entry(Heritage())).forEach {
                it.rating = 4.5
                it.reviewCount = 12
                assertThat(it.shows(PracticalField.RATING)).isFalse()
                assertThat(it.guardedRating()).isNull()
            }
        }
    }

    @Nested
    @DisplayName("completeness (the record's field grid)")
    inner class CompletenessRules {
        @Test
        fun `the prototype's church record reads six of nine`() {
            // Settlement, Category, Coordinates, Established, Status and Festival known;
            // Photographer, Opening hours and Architect not recorded.
            val igreja = entry(Heritage(), "Igreja Nossa Senhora do Monte").apply {
                established = "c. 1826"
                conditionStatus = "under reconstruction since 2023"
                festival = "second weekend of August"
            }

            val c = igreja.completeness(hero = HeroFacts(photographerCredit = null))

            assertThat(c.documented).isEqualTo(6)
            assertThat(c.total).isEqualTo(9)
            assertThat(c.missingFields).containsExactly("photographer", "openingHours", "architect")
        }

        @Test
        fun `a church uses the same nine rows as heritage`() {
            val church = entry(Church(), "Igreja Probe")
            val c = church.completeness(hero = HeroFacts(photographerCredit = null))

            assertThat(c.total).isEqualTo(9)
            assertThat(c.missingFields).containsExactly(
                "established",
                "conditionStatus",
                "festival",
                "photographer",
                "openingHours",
                "architect",
            )
        }

        @Test
        fun `description and photograph are not rows in the grid`() {
            val described = entry(Heritage(), "Described")
            val blank = entry(Heritage(), "Blank").apply { description = "" }

            assertThat(blank.completeness(hero = null)).isEqualTo(described.completeness(hero = null))
            assertThat(described.completeness(hero = null).missingFields)
                .doesNotContain("description", "photograph")
        }

        @Test
        fun `settlement, category and coordinates are documented structural rows`() {
            val bay = entry(Nature(), "Faja d'Agua")
            val c = bay.completeness(hero = null)

            assertThat(c.total).isEqualTo(3)
            assertThat(c.documented).isEqualTo(3)
            assertThat(c.missingFields).isEmpty()
        }

        @Test
        fun `unset coordinates count as missing`() {
            // Public submissions without a location are stored at 0,0.
            val submitted = entry(Nature(), "Unplaced").apply {
                latitude = 0.0
                longitude = 0.0
            }

            assertThat(submitted.completeness(hero = null).missingFields).containsExactly("coordinates")
        }

        @Test
        fun `photographer is a row only when a hero exists`() {
            val bay = entry(Nature(), "Faja d'Agua")

            assertThat(bay.completeness(hero = null).total).isEqualTo(3)
            assertThat(bay.completeness(hero = HeroFacts(photographerCredit = null)).total).isEqualTo(4)
        }

        @Test
        fun `a recorded credit documents the photographer, and not known does not`() {
            val bay = entry(Nature(), "Faja d'Agua")

            assertThat(bay.completeness(HeroFacts("Torbenbrinker")).missingFields).isEmpty()
            listOf(null, "", "   ", "not known", " Not Known ").forEach { credit ->
                assertThat(bay.completeness(HeroFacts(credit)).missingFields)
                    .describedAs("credit '$credit'")
                    .containsExactly("photographer")
            }
        }

        @Test
        fun `a hotel counts its full practical field set`() {
            val hotel = entry(Hotel(), "Pousada Nova Sintra")
            val c = hotel.completeness(hero = null)
            // settlement, category, coordinates, rating, phone, email, website, hours, amenities
            assertThat(c.total).isEqualTo(9)
            assertThat(c.documented).isEqualTo(3)
        }

        @Test
        fun `a heritage record is not penalised for its ineligible contact fields`() {
            val praca = entry(Heritage(), "Praca Eugenio Tavares")
            val c = praca.completeness(hero = null)

            assertThat(c.total).isEqualTo(8)
            assertThat(c.missingFields).doesNotContain("phoneNumber", "email", "website", "rating")
        }

        @Test
        fun `documenting a field moves the fraction`() {
            val heritage = entry(Heritage(), "Igreja Nossa Senhora do Monte")
            val before = heritage.completeness(hero = null)
            heritage.established = "c. 1826"
            val after = heritage.completeness(hero = null)

            assertThat(after.documented).isEqualTo(before.documented + 1)
            assertThat(after.total).isEqualTo(before.total)
            assertThat(after.missingFields).doesNotContain("established")
        }
    }
}
