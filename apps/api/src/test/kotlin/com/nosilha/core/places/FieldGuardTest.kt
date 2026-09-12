package com.nosilha.core.places

import com.nosilha.core.places.domain.Beach
import com.nosilha.core.places.domain.Church
import com.nosilha.core.places.domain.DirectoryEntry
import com.nosilha.core.places.domain.Heritage
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
 * Unit tests for the category guard and derived completeness (spec 033, FR-002/FR-003).
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

    @Nested
    @DisplayName("eligibility (drives the completeness denominator)")
    inner class Eligibility {
        @Test
        fun `only accommodation is eligible for a rating`() {
            assertThat(entry(Hotel()).supports(PracticalField.RATING)).isTrue()
            listOf(Restaurant(), Beach(), Heritage(), Nature(), Viewpoint(), Trail(), Church(), Port())
                .forEach { assertThat(entry(it).supports(PracticalField.RATING)).isFalse() }
        }

        @Test
        fun `only accommodation and dining are eligible for contact and hours`() {
            listOf(Hotel(), Restaurant()).forEach {
                val e = entry(it)
                assertThat(e.supports(PracticalField.CONTACT)).isTrue()
                assertThat(e.supports(PracticalField.OPENING_HOURS)).isTrue()
            }
            listOf(Beach(), Heritage(), Nature(), Viewpoint(), Trail(), Church(), Port()).forEach {
                val e = entry(it)
                assertThat(e.supports(PracticalField.CONTACT)).isFalse()
                assertThat(e.supports(PracticalField.OPENING_HOURS)).isFalse()
            }
        }

        @Test
        fun `cuisine is dining only and amenities are accommodation only`() {
            assertThat(entry(Restaurant()).supports(PracticalField.CUISINE)).isTrue()
            assertThat(entry(Hotel()).supports(PracticalField.CUISINE)).isFalse()
            assertThat(entry(Hotel()).supports(PracticalField.AMENITIES)).isTrue()
            assertThat(entry(Restaurant()).supports(PracticalField.AMENITIES)).isFalse()
        }
    }

    @Nested
    @DisplayName("display (eligible, or a value already exists)")
    inner class Display {
        @Test
        fun `a heritage record carrying real contact details still shows them`() {
            // casa-eugenio-tavares is a Heritage record with a genuine phone, email,
            // website and opening hours. The archive holds them, so the record shows
            // them -- without Heritage becoming eligible.
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
            assertThat(praca.shows(PracticalField.OPENING_HOURS)).isFalse()
        }

        @Test
        fun `a stray rating on a non-accommodation record is never surfaced`() {
            // RATING has no value-exists escape hatch: FR-011 requires accommodation be
            // the only surface that renders one, even if stray data exists.
            val church = entry(Church()).apply {
                rating = 4.5
                reviewCount = 12
            }
            assertThat(church.shows(PracticalField.RATING)).isFalse()
            assertThat(church.guardedRating()).isNull()
        }
    }

    @Nested
    @DisplayName("completeness")
    inner class CompletenessRules {
        @Test
        fun `a bay counts only description and photograph`() {
            val bay = entry(Nature(), "Faja d'Agua")
            val c = bay.completeness()
            assertThat(c.total).isEqualTo(2)
            assertThat(c.documented).isEqualTo(1)
            assertThat(c.missingFields).containsExactly("photograph")
            // The point of the guard: a stretch of coast is not incomplete for lacking
            // opening hours, because they are not in its denominator at all.
            assertThat(c.missingFields).doesNotContain("openingHours", "amenities", "rating")
        }

        @Test
        fun `a hotel counts its full practical field set`() {
            val hotel = entry(Hotel(), "Pousada Nova Sintra")
            val c = hotel.completeness()
            // description, photograph, rating, phone, email, website, hours, amenities
            assertThat(c.total).isEqualTo(8)
            assertThat(c.documented).isEqualTo(1)
        }

        @Test
        fun `a heritage record is not penalised for its ineligible contact fields`() {
            val praca = entry(Heritage(), "Praca Eugenio Tavares")
            assertThat(praca.completeness().total).isEqualTo(2)
        }

        @Test
        fun `documenting a field moves the fraction`() {
            val heritage = entry(Heritage(), "Igreja Nossa Senhora do Monte")
            val before = heritage.completeness()
            heritage.imageUrl = "/images/directory/heritage/igreja-nossa-senhora-do-monte.jpg"
            val after = heritage.completeness()

            assertThat(before.documented).isEqualTo(1)
            assertThat(after.documented).isEqualTo(2)
            assertThat(after.total).isEqualTo(before.total)
            assertThat(after.missingFields).isEmpty()
        }
    }
}
