package com.nosilha.core.gallery

import com.nosilha.core.gallery.domain.MediaRole
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

/**
 * Guards the V16 gallery media columns (spec 034, FR-019, FR-022, FR-023, T-09).
 *
 * <p>Heroes become gallery rows in Wave 3, so the invariants that make that safe are
 * pinned here first: an entry has at most one hero, a hero always belongs to an entry,
 * and deleting the entry cannot leave a hero pointing nowhere.</p>
 *
 * <p>Fixtures are inserted with SQL literals for the enum columns: bound string
 * parameters are typed `varchar`, which PostgreSQL will not cast to an enum.</p>
 */
@ActiveProfiles("test")
@SpringBootTest
@DisplayName("V16 gallery media role, dimensions and provenance")
class GalleryMediaRoleMigrationTest {
    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    private val entries = mutableListOf<UUID>()
    private val media = mutableListOf<UUID>()

    @AfterEach
    fun cleanup() {
        media.forEach { jdbcTemplate.update("DELETE FROM gallery_media WHERE id = ?", it) }
        entries.forEach { jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", it) }
        media.clear()
        entries.clear()
    }

    @Test
    fun `adds the role enum, dimensions and provenance flag`() {
        val labels = jdbcTemplate.queryForList(
            """
            SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'gallery_media_role' ORDER BY e.enumsortorder
            """.trimIndent(),
            String::class.java,
        )
        assertThat(labels).containsExactly("ARCHIVE", "HERO")

        val columns = jdbcTemplate
            .queryForList(
                """
                SELECT column_name, udt_name, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'gallery_media'
                  AND column_name IN ('role', 'width', 'height', 'identifiable_person')
                """.trimIndent(),
            ).associateBy { it["column_name"] }

        assertThat(columns["role"]!!["udt_name"]).isEqualTo("gallery_media_role")
        assertThat(columns["role"]!!["is_nullable"]).isEqualTo("NO")
        assertThat(columns["width"]!!["udt_name"]).isEqualTo("int4")
        assertThat(columns["width"]!!["is_nullable"]).isEqualTo("YES")
        assertThat(columns["height"]!!["udt_name"]).isEqualTo("int4")
        assertThat(columns["height"]!!["is_nullable"]).isEqualTo("YES")
        assertThat(columns["identifiable_person"]!!["udt_name"]).isEqualTo("bool")
        assertThat(columns["identifiable_person"]!!["is_nullable"]).isEqualTo("NO")
    }

    @Test
    fun `a record created without a role is an unflagged archive record`() {
        val id = insertMedia(entryId = null)

        val row = jdbcTemplate.queryForMap(
            "SELECT role::text AS role, identifiable_person, width, height FROM gallery_media WHERE id = ?",
            id,
        )
        assertThat(row["role"]).isEqualTo("ARCHIVE")
        assertThat(row["identifiable_person"]).isEqualTo(false)
        assertThat(row["width"]).isNull()
        assertThat(row["height"]).isNull()
    }

    @Test
    fun `an entry has at most one hero`() {
        val entryId = insertEntry()
        insertMedia(entryId, role = "HERO")

        assertThatThrownBy { insertMedia(entryId, role = "HERO") }
            .isInstanceOf(DataIntegrityViolationException::class.java)
            .hasMessageContaining("uq_gallery_media_hero_per_entry")
    }

    @Test
    fun `an entry may hold any number of archive records beside its hero`() {
        val entryId = insertEntry()
        insertMedia(entryId, role = "HERO")
        insertMedia(entryId, role = "ARCHIVE")
        insertMedia(entryId, role = "ARCHIVE")

        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM gallery_media WHERE entry_id = ?",
            Int::class.java,
            entryId,
        )
        assertThat(count).isEqualTo(3)
    }

    @Test
    fun `a hero must belong to an entry`() {
        assertThatThrownBy { insertMedia(entryId = null, role = "HERO") }
            .isInstanceOf(DataIntegrityViolationException::class.java)
            .hasMessageContaining("ck_gallery_media_hero_has_entry")
    }

    @Test
    fun `deleting an entry keeps its hero as an archive record`() {
        // entry_id is ON DELETE SET NULL. Without the demotion trigger, the hero check
        // would reject that update and the entry could never be deleted.
        val entryId = insertEntry()
        val heroId = insertMedia(entryId, role = "HERO")

        jdbcTemplate.update("DELETE FROM directory_entries WHERE id = ?", entryId)
        entries.remove(entryId)

        val row = jdbcTemplate.queryForMap("SELECT role::text AS role, entry_id FROM gallery_media WHERE id = ?", heroId)
        assertThat(row["role"]).isEqualTo("ARCHIVE")
        assertThat(row["entry_id"]).isNull()
    }

    @Test
    fun `the entity maps role, dimensions and provenance`() {
        val entryId = insertEntry()
        val id = insertMedia(entryId, role = "HERO")
        jdbcTemplate.update(
            "UPDATE gallery_media SET width = 1200, height = 800, identifiable_person = TRUE WHERE id = ?",
            id,
        )

        val loaded = galleryMediaRepository.findById(id).orElseThrow() as UserUploadedMedia

        assertThat(loaded.role).isEqualTo(MediaRole.HERO)
        assertThat(loaded.width).isEqualTo(1200)
        assertThat(loaded.height).isEqualTo(800)
        assertThat(loaded.identifiablePerson).isTrue()
    }

    private fun insertEntry(): UUID {
        val id = UUID.randomUUID()
        jdbcTemplate.update(
            """
            INSERT INTO directory_entries (id, slug, name, description, category, town, latitude, longitude, status)
            VALUES (?, ?, 'Role Probe', 'Probe row.', 'Heritage', 'Nova Sintra', 14.87, -24.69, 'PUBLISHED')
            """.trimIndent(),
            id,
            "role-probe-$id",
        )
        entries += id
        return id
    }

    private fun insertMedia(
        entryId: UUID?,
        role: String? = null,
    ): UUID {
        require(role == null || role in setOf("ARCHIVE", "HERO")) { "unexpected role literal: $role" }
        val id = UUID.randomUUID()
        val roleColumn = if (role != null) ", role" else ""
        val roleValue = if (role != null) ", '$role'" else ""
        jdbcTemplate.update(
            "INSERT INTO gallery_media (id, media_source, status, entry_id$roleColumn) " +
                "VALUES (?, 'USER_UPLOAD', 'ACTIVE', ?$roleValue)",
            id,
            entryId,
        )
        media += id
        return id
    }
}
