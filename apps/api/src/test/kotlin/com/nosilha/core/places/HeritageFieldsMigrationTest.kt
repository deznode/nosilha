package com.nosilha.core.places

import com.nosilha.core.places.domain.Heritage
import com.nosilha.core.places.repository.DirectoryEntryRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.io.ClassPathResource
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles

/**
 * Guards the V15 heritage columns (spec 034, FR-016, T-06).
 *
 * <p>The test context runs every migration from an empty schema, so a passing context
 * is the "applies on an empty schema and on top of V14" check. The assertions below pin
 * the shape the place record reads: four free-text, nullable columns on
 * `directory_entries`, and nothing else touched.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@DisplayName("V15 heritage columns migration")
class HeritageFieldsMigrationTest {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var directoryEntryRepository: DirectoryEntryRepository

    @Test
    fun `adds four nullable free-text columns to directory entries`() {
        val columns = jdbcTemplate.queryForList(
            """
            SELECT column_name, data_type, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'directory_entries'
              AND column_name IN ('established', 'condition_status', 'festival', 'architect')
            ORDER BY column_name
            """.trimIndent(),
        )

        assertThat(columns.map { it["column_name"] })
            .containsExactly("architect", "condition_status", "established", "festival")
        columns.forEach {
            assertThat(it["data_type"]).isEqualTo("character varying")
            assertThat(it["is_nullable"]).isEqualTo("YES")
            assertThat((it["character_maximum_length"] as Number).toInt()).isEqualTo(255)
        }
    }

    @Test
    fun `is recorded as applied in order after the settlement migration`() {
        val applied = jdbcTemplate.queryForList(
            "SELECT version FROM flyway_schema_history WHERE success AND version IN ('14', '15') ORDER BY installed_rank",
            String::class.java,
        )

        assertThat(applied).containsExactly("14", "15")
    }

    @Test
    fun `alters no table other than directory entries`() {
        val sql = ClassPathResource("db/migration/V15__add_heritage_fields_to_directory_entries.sql")
            .inputStream
            .bufferedReader()
            .readText()
        val alteredTables = Regex("""ALTER\s+TABLE\s+(\w+)""", RegexOption.IGNORE_CASE)
            .findAll(sql)
            .map { it.groupValues[1].lowercase() }
            .toSet()

        assertThat(alteredTables).containsExactly("directory_entries")
        assertThat(sql).doesNotContainIgnoringCase("CREATE TABLE").doesNotContainIgnoringCase("DROP ")
    }

    @Test
    fun `the entity writes and reads the heritage fields`() {
        val saved = directoryEntryRepository.saveAndFlush(
            Heritage().apply {
                name = "Heritage Column Probe"
                slug = "heritage-column-probe"
                description = "Probe row."
                town = "Nova Sintra"
                latitude = 14.87
                longitude = -24.69
                established = "c. 1826"
                conditionStatus = "under reconstruction since 2023"
                festival = "second weekend of August"
                architect = "not known"
            },
        )

        try {
            val row = jdbcTemplate.queryForMap(
                "SELECT established, condition_status, festival, architect FROM directory_entries WHERE id = ?",
                saved.id,
            )
            assertThat(row["established"]).isEqualTo("c. 1826")
            assertThat(row["condition_status"]).isEqualTo("under reconstruction since 2023")
            assertThat(row["festival"]).isEqualTo("second weekend of August")
            assertThat(row["architect"]).isEqualTo("not known")
        } finally {
            jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", saved.id)
        }
    }
}
