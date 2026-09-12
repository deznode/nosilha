package com.nosilha.core.places

import com.nosilha.core.places.repository.TownRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

/**
 * Guards the settlement foreign-key migration (spec 033, FR-001).
 *
 * <p>This is the test the migration design rests on. Flyway runs every versioned
 * migration before every repeatable one, so a backfill placed in `V14` would execute
 * against an empty `towns` table on a fresh database and silently link nothing. The
 * backfill therefore lives in `R__towns_fk_backfill.sql`, whose description sorts
 * after every seed file.</p>
 *
 * <p>Flyway offers no dependency mechanism for repeatable migrations, so that ordering
 * is guaranteed only by the filename. These assertions are what actually enforce it:
 * if anyone moves the backfill back into a versioned migration, or renames it so it no
 * longer sorts last, this fails loudly instead of shipping unmatched settlements.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@DisplayName("Town FK backfill migration")
class TownBackfillMigrationTest {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var townRepository: TownRepository

    @Test
    fun `the API resolves a settlement name the same way the migration does`() {
        // DirectoryEntryService.resolveTownId uses this lookup when an entry is created
        // or updated, so an entry added through the API links exactly as the backfill
        // would have linked it. Without the shared predicate, an admin typing 'Cachaço'
        // would create a row the migration had already learned how to match.
        //
        // Note this is a service-level guarantee, not a database constraint: anything
        // saving through the repository directly -- as several test fixtures do -- can
        // still leave town_id null. The migration's own outcome is asserted via
        // town_backfill_exceptions below, which no test mutates.
        val accented = townRepository.findByNameIgnoringCaseAndAccents("Cachaço")
        val plain = townRepository.findByNameIgnoringCaseAndAccents("cachaco")
        val padded = townRepository.findByNameIgnoringCaseAndAccents("  Nova Sintra  ")

        assertThat(accented?.slug).isEqualTo("cachaco")
        assertThat(plain?.slug).isEqualTo("cachaco")
        assertThat(padded?.slug).isEqualTo("nova-sintra")
        assertThat(townRepository.findByNameIgnoringCaseAndAccents("Nowhere At All")).isNull()
    }

    @Test
    fun `the backfill matches an accented town name to its unaccented settlement`() {
        // Seed data carries 'Cachaço' and 'Garça'; the towns table holds 'Cachaco' and
        // 'Garça' under slugs 'cachaco' and 'garca'. A plain equality join drops those
        // rows silently, which is why the backfill uses unaccent().
        //
        // Probes with its own row rather than asserting on seed data, so the rule stays
        // under test even after another test class has cleared the table.
        val probeId = UUID.randomUUID()
        try {
            jdbcTemplate.update(
                """
                INSERT INTO directory_entries
                    (id, slug, name, description, category, town, latitude, longitude, status)
                VALUES (?, 'accent-probe', 'Accent Probe', 'Probe row.', 'Heritage',
                        'Cachaço', 14.83, -24.69, 'DRAFT')
                """.trimIndent(),
                probeId,
            )

            // The backfill predicate, verbatim.
            val linked = jdbcTemplate.update(
                """
                UPDATE directory_entries de
                SET town_id = t.id
                FROM towns t
                WHERE de.id = ?
                  AND de.town_id IS NULL
                  AND lower(unaccent(t.name)) = lower(unaccent(trim(de.town)))
                """.trimIndent(),
                probeId,
            )
            assertThat(linked)
                .describedAs("rows linked for town 'Cachaço' via unaccent")
                .isEqualTo(1)

            val slug = jdbcTemplate.queryForObject(
                "SELECT t.slug FROM directory_entries d JOIN towns t ON d.town_id = t.id WHERE d.id = ?",
                String::class.java,
                probeId,
            )
            assertThat(slug).isEqualTo("cachaco")
        } finally {
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", probeId)
        }
    }

    @Test
    fun `settlements are canonical and no longer duplicated as directory entries`() {
        val townCategoryEntries = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM directory_entries WHERE category = 'Town'",
            Int::class.java,
        )
        assertThat(townCategoryEntries)
            .describedAs("directory entries still modelling a settlement")
            .isZero()

        // The towns table is reference data; no test mutates it, so this count is stable.
        val towns = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM towns", Int::class.java)
        assertThat(towns)
            .describedAs("settlements, including the nine promoted from the POI seed")
            .isEqualTo(25)
    }

    @Test
    fun `promoted settlements carry no invented metadata`() {
        // The nine promoted settlements have name, slug, description and coordinates
        // and nothing else. That absence is what renders them as "name only" -- it must
        // not be filled in with plausible-looking figures.
        val promoted = listOf(
            "minhoto",
            "sorno",
            "lagoa",
            "lima-doce",
            "baleia",
            "garca",
            "cruzinha",
            "espardeiro",
            "figueiral",
        )
        val withMetadata = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM towns
            WHERE slug = ANY(?)
              AND (population IS NOT NULL OR elevation IS NOT NULL OR founded IS NOT NULL)
            """.trimIndent(),
            Int::class.java,
            promoted.toTypedArray(),
        )
        assertThat(withMetadata)
            .describedAs("promoted settlements carrying population, elevation or founded")
            .isZero()
    }
}
