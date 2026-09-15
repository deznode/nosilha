package com.nosilha.core.gallery

import org.assertj.core.api.Assertions.assertThat
import org.flywaydb.core.Flyway
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.io.ClassPathResource
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator
import org.springframework.test.context.ActiveProfiles
import java.util.UUID
import javax.sql.DataSource

/**
 * Entry images become gallery heroes (spec 034 FR-023, T-18, ADR-001).
 *
 * <p>V18 runs once, against databases whose entries still carry `image_url`, and V20 drops
 * that column in the same release. The test database is long past both, so the copy runs on
 * a scratch database migrated to V17, given entries, then migrated to V18.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@DisplayName("Entry images become gallery heroes")
class HeroCopyMigrationTest {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var dataSource: DataSource

    @Value("\${spring.datasource.password}")
    private lateinit var password: String

    @AfterEach
    fun restoreIgrejaHero() {
        runSeed("R__seed_directory_entries.sql")
        jdbcTemplate.update(
            "DELETE FROM gallery_media WHERE role = 'HERO' AND entry_id = (SELECT id FROM directory_entries WHERE slug = ?)",
            IGREJA
        )
        runSeed("R__seed_gallery_heroes.sql")
    }

    @Test
    fun `V18 gives each entry image exactly one hero serving that image`() {
        val database = "hero_copy_${UUID.randomUUID().toString().replace("-", "").take(12)}"
        jdbcTemplate.execute("CREATE DATABASE $database")
        try {
            val scratch = scratchDataSource(database)
            migrate(scratch, "17")
            val db = JdbcTemplate(scratch)

            val plain = entry(db, "copy-plain", "/images/probe/plain.jpg")
            val padded = entry(db, "copy-padded", " /images/probe/padded.jpg ")
            val alreadyHeaded = entry(db, "copy-already-headed", "/images/probe/stale.jpg")
            db.update(
                "INSERT INTO gallery_media (media_source, status, role, show_in_gallery, entry_id, public_url) " +
                    "VALUES ('USER_UPLOAD', 'ACTIVE', 'HERO', false, ?, '/images/probe/current.jpg')",
                alreadyHeaded,
            )
            // An earlier promote-hero copied one of the entry's own uploads into image_url.
            val promoted = entry(db, "copy-promoted", "/images/probe/upload.jpg")
            val upload = UUID.randomUUID()
            db.update(
                "INSERT INTO gallery_media (id, media_source, status, role, entry_id, public_url, photographer_credit) " +
                    "VALUES (?, 'USER_UPLOAD', 'ACTIVE', 'ARCHIVE', ?, '/images/probe/upload.jpg', 'A. Photographer')",
                upload,
                promoted,
            )
            val blank = entry(db, "copy-blank", "   ")
            val none = entry(db, "copy-none", null)

            migrate(scratch, "18")

            assertThat(heroes(db, plain)).hasSize(1)
            heroes(db, plain).single().let { hero ->
                assertThat(hero["public_url"]).isEqualTo("/images/probe/plain.jpg")
                assertThat(hero["media_source"]).isEqualTo("USER_UPLOAD")
                assertThat(hero["status"]).isEqualTo("ACTIVE")
                assertThat(hero["show_in_gallery"]).isEqualTo(false)
                assertThat(hero["photographer_credit"]).isNull()
            }
            assertThat(heroes(db, padded).single()["public_url"]).isEqualTo("/images/probe/padded.jpg")
            // An entry that already has a hero keeps it.
            assertThat(heroes(db, alreadyHeaded)).hasSize(1)
            assertThat(heroes(db, alreadyHeaded).single()["public_url"]).isEqualTo("/images/probe/current.jpg")
            // The upload itself becomes the hero, with its credit; no second row serves the same image.
            assertThat(heroes(db, promoted)).hasSize(1)
            heroes(db, promoted).single().let { hero ->
                assertThat(hero["id"]).isEqualTo(upload)
                assertThat(hero["photographer_credit"]).isEqualTo("A. Photographer")
            }
            assertThat(db.queryForObject("SELECT COUNT(*) FROM gallery_media WHERE entry_id = ?", Int::class.java, promoted))
                .isEqualTo(1)
            assertThat(heroes(db, blank)).isEmpty()
            assertThat(heroes(db, none)).isEmpty()
        } finally {
            jdbcTemplate.execute("DROP DATABASE IF EXISTS $database WITH (FORCE)")
        }
    }

    @Test
    fun `the hero seed gives Igreja one credited hero, however often it runs`() {
        runSeed("R__seed_directory_entries.sql")
        runSeed("R__seed_gallery_heroes.sql")
        runSeed("R__seed_gallery_heroes.sql")

        assertThat(igrejaHeroes()).hasSize(1)
        igrejaHeroes().single().let { hero ->
            assertThat(hero["public_url"]).isEqualTo(IGREJA_IMAGE)
            assertThat(hero["photographer_credit"]).isEqualTo("Torbenbrinker")
            assertThat(hero["archive_source"]).isEqualTo("Wikimedia Commons, CC BY-SA 3.0, 2010")
            assertThat(hero["show_in_gallery"]).isEqualTo(false)
        }
    }

    @Test
    fun `the hero seed credits the copied Igreja image but never another one`() {
        runSeed("R__seed_directory_entries.sql")
        jdbcTemplate.update(
            "DELETE FROM gallery_media WHERE role = 'HERO' AND entry_id = (SELECT id FROM directory_entries WHERE slug = ?)",
            IGREJA
        )
        // What V18 leaves on a database that held the image: the right image, no credit.
        jdbcTemplate.update(
            "INSERT INTO gallery_media (media_source, status, role, show_in_gallery, entry_id, public_url) " +
                "SELECT 'USER_UPLOAD', 'ACTIVE', 'HERO', false, id, ? FROM directory_entries WHERE slug = ?",
            IGREJA_IMAGE,
            IGREJA,
        )

        runSeed("R__seed_gallery_heroes.sql")
        assertThat(igrejaHeroes()).hasSize(1)
        assertThat(igrejaHeroes().single()["photographer_credit"]).isEqualTo("Torbenbrinker")

        // A curator has since given the record a different image.
        jdbcTemplate.update(
            "UPDATE gallery_media SET public_url = '/images/probe/other.jpg', photographer_credit = NULL, archive_source = NULL " +
                "WHERE role = 'HERO' AND entry_id = (SELECT id FROM directory_entries WHERE slug = ?)",
            IGREJA,
        )
        runSeed("R__seed_gallery_heroes.sql")
        igrejaHeroes().single().let { hero ->
            assertThat(hero["public_url"]).isEqualTo("/images/probe/other.jpg")
            assertThat(hero["photographer_credit"]).isNull()
        }
    }

    @Test
    fun `the hero seed runs after the entries it heads`() {
        // Flyway applies repeatable migrations in order of their description.
        assertThat(ClassPathResource("db/seed/R__seed_gallery_heroes.sql").exists()).isTrue()
        assertThat("seed_gallery_heroes").isGreaterThan("seed_directory_entries")
    }

    private fun scratchDataSource(database: String): DataSource {
        val (url, user) = dataSource.connection.use { it.metaData.url to it.metaData.userName }
        require(DATABASE_IN_URL.containsMatchIn(url)) { "expected a plain PostgreSQL URL, got $url" }
        return DriverManagerDataSource(url.replaceFirst(DATABASE_IN_URL, "\$1$database"), user, password)
    }

    private fun migrate(
        target: DataSource,
        version: String,
    ) {
        Flyway
            .configure()
            .dataSource(target)
            .locations("classpath:db/migration", "classpath:db/seed")
            .target(version)
            .load()
            .migrate()
    }

    private fun entry(
        db: JdbcTemplate,
        slug: String,
        imageUrl: String?,
    ): UUID {
        val id = UUID.randomUUID()
        db.update(
            """
            INSERT INTO directory_entries (id, slug, name, description, category, town, latitude, longitude, image_url, status)
            VALUES (?, ?, 'Copy Probe', 'Probe row.', 'Heritage', 'Nova Sintra', 14.87, -24.69, ?, 'PUBLISHED')
            """.trimIndent(),
            id,
            slug,
            imageUrl,
        )
        return id
    }

    private fun heroes(
        db: JdbcTemplate,
        entryId: UUID,
    ): List<Map<String, Any?>> =
        db.queryForList(
            "SELECT id, media_source, public_url, status::text AS status, show_in_gallery, photographer_credit " +
                "FROM gallery_media WHERE entry_id = ? AND role = 'HERO'",
            entryId,
        )

    private fun igrejaHeroes(): List<Map<String, Any?>> =
        jdbcTemplate.queryForList(
            "SELECT g.public_url, g.photographer_credit, g.archive_source, g.show_in_gallery FROM gallery_media g " +
                "JOIN directory_entries d ON g.entry_id = d.id WHERE d.slug = ? AND g.role = 'HERO'",
            IGREJA,
        )

    private fun runSeed(file: String) {
        ResourceDatabasePopulator(ClassPathResource("db/seed/$file")).execute(dataSource)
    }

    companion object {
        private const val IGREJA = "igreja-nossa-senhora-do-monte"
        private const val IGREJA_IMAGE = "/images/directory/heritage/igreja-nossa-senhora-do-monte.jpg"
        private val DATABASE_IN_URL = Regex("^(jdbc:postgresql://[^/]+/)[^?]*")
    }
}
