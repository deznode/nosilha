package com.nosilha.core.gallery.domain

import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.shared.events.AiResultsApprovedEvent
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

class GalleryServiceTest {
    private val repository: GalleryMediaRepository = mock()
    private val userProfileQueryService: UserProfileQueryService = mock()
    private val meterRegistry = SimpleMeterRegistry()

    private val service = GalleryService(
        r2StorageService = null,
        repository = repository,
        userProfileQueryService = userProfileQueryService,
        meterRegistry = meterRegistry,
    )

    @Nested
    @DisplayName("isRawFilename — static companion function")
    inner class IsRawFilenameTests {
        @ParameterizedTest
        @ValueSource(
            strings = [
                "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                "0fa3b1c2-d4e5-6789-0abc-def123456789.jpg",
                "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
            ],
        )
        @DisplayName("Should detect UUID-prefixed filenames")
        fun `detects UUID prefix patterns`(title: String) {
            assertThat(GalleryService.isRawFilename(title)).isTrue()
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "DJI_0042",
                "IMG_20240101_123456",
                "DSC_0001",
                "DCIM_0001",
                "DSCN_0001",
                "P_20240101",
                "dji_0042",
                "img_20240101",
            ],
        )
        @DisplayName("Should detect camera filename prefixes")
        fun `detects camera filename prefixes`(title: String) {
            assertThat(GalleryService.isRawFilename(title)).isTrue()
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "photo.jpg",
                "sunset.jpeg",
                "landscape.png",
                "heritage.webp",
                "island.heic",
                "clip.mp4",
                "drone.mov",
                "MyPhoto.JPG",
                "SUNSET.JPEG",
            ],
        )
        @DisplayName("Should detect file extensions in title")
        fun `detects file extensions`(title: String) {
            assertThat(GalleryService.isRawFilename(title)).isTrue()
        }

        @ParameterizedTest
        @ValueSource(strings = ["", "   ", "\t", "\n"])
        @DisplayName("Should treat blank strings as raw filenames")
        fun `treats blank strings as raw`(title: String) {
            assertThat(GalleryService.isRawFilename(title)).isTrue()
        }

        @ParameterizedTest
        @ValueSource(
            strings = [
                "Church of São João Baptista",
                "Sunset over Fajã d'Água",
                "Historical Heritage Site",
                "Vila Nova Sintra panoramic view",
                "Brava Island landscape",
                "Festival de música",
            ],
        )
        @DisplayName("Should not flag human-authored titles")
        fun `preserves human-authored titles`(title: String) {
            assertThat(GalleryService.isRawFilename(title)).isFalse()
        }

        @Test
        @DisplayName("Should not flag titles that merely contain UUID-like substrings")
        fun `does not flag UUID-like substrings in the middle`() {
            assertThat(GalleryService.isRawFilename("Photo at a1b2c3d4 church")).isFalse()
        }

        @Test
        @DisplayName("Should not flag titles with camera-like words in the middle")
        fun `does not flag camera words mid-title`() {
            assertThat(GalleryService.isRawFilename("My IMG collection")).isFalse()
        }
    }

    @Nested
    @DisplayName("onAiResultsApproved — AI content promotion")
    inner class AiContentPromotionTests {
        private val mediaId = UUID.randomUUID()
        private val moderatorId = UUID.randomUUID()
        private val analysisRunId = UUID.randomUUID()

        private fun createMedia(
            title: String = "IMG_20240101_123456",
            description: String? = null,
            altText: String? = null,
        ): UserUploadedMedia =
            UserUploadedMedia().apply {
                id = mediaId
                this.title = title
                this.description = description
                this.altText = altText
                status = GalleryMediaStatus.PENDING_REVIEW
            }

        private fun createEvent(
            title: String? = "AI Generated Title",
            description: String? = "AI generated description of the image",
            altText: String? = "A scenic view of Brava Island coastline",
            tags: List<String> = listOf("landscape", "coastline"),
            labels: String? = """{"landscape": 0.95}""",
        ): AiResultsApprovedEvent =
            AiResultsApprovedEvent(
                mediaId = mediaId,
                analysisRunId = analysisRunId,
                title = title,
                altText = altText,
                description = description,
                tags = tags,
                labels = labels,
                moderatorId = moderatorId,
            )

        @Test
        @DisplayName("Should promote AI title when current title is a raw filename")
        fun `promotes title when raw filename`() {
            val media = createMedia(title = "IMG_20240101_123456")
            val event = createEvent(title = "Church of São João Baptista")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.title).isEqualTo("Church of São João Baptista")
            verify(repository).save(media)
        }

        @Test
        @DisplayName("Should NOT promote AI title when current title is human-authored")
        fun `preserves human-authored title`() {
            val media = createMedia(title = "My lovely church photo")
            val event = createEvent(title = "AI Church Title")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.title).isEqualTo("My lovely church photo")
        }

        @Test
        @DisplayName("Should promote AI description when description is null")
        fun `promotes description when null`() {
            val media = createMedia(description = null)
            val event = createEvent(description = "A beautiful coastal scene")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.description).isEqualTo("A beautiful coastal scene")
        }

        @Test
        @DisplayName("Should promote AI description when description is blank")
        fun `promotes description when blank`() {
            val media = createMedia(description = "   ")
            val event = createEvent(description = "A beautiful coastal scene")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.description).isEqualTo("A beautiful coastal scene")
        }

        @Test
        @DisplayName("Should NOT promote AI description when description already exists")
        fun `preserves existing description`() {
            val media = createMedia(description = "Existing human description")
            val event = createEvent(description = "AI generated description")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.description).isEqualTo("Existing human description")
        }

        @Test
        @DisplayName("Should always promote AI alt text")
        fun `always promotes alt text`() {
            val media = createMedia(altText = "Old alt text")
            val event = createEvent(altText = "New AI alt text")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.altText).isEqualTo("New AI alt text")
        }

        @Test
        @DisplayName("Should promote alt text even when existing is null")
        fun `promotes alt text from null`() {
            val media = createMedia(altText = null)
            val event = createEvent(altText = "Accessible alt text")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.altText).isEqualTo("Accessible alt text")
        }

        @Test
        @DisplayName("Should store AI fields as audit trail")
        fun `stores AI fields unchanged`() {
            val media = createMedia()
            val event = createEvent(
                title = "AI Title",
                description = "AI Description",
                altText = "AI Alt Text",
                tags = listOf("tag1", "tag2"),
                labels = """{"label": 0.9}""",
            )
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.aiTitle).isEqualTo("AI Title")
            assertThat(media.aiDescription).isEqualTo("AI Description")
            assertThat(media.aiAltText).isEqualTo("AI Alt Text")
            assertThat(media.aiTags).containsExactly("tag1", "tag2")
            assertThat(media.aiLabels).isEqualTo("""{"label": 0.9}""")
            assertThat(media.aiProcessedAt).isNotNull()
        }

        @Test
        @DisplayName("Should handle null AI title gracefully — no promotion")
        fun `handles null AI title`() {
            val media = createMedia(title = "IMG_0001")
            val event = createEvent(title = null)
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.title).isEqualTo("IMG_0001")
        }

        @Test
        @DisplayName("Should handle blank AI description — no promotion")
        fun `handles blank AI description`() {
            val media = createMedia(description = null)
            val event = createEvent(description = "  ")
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.description).isNull()
        }

        @Test
        @DisplayName("Should handle null AI alt text — no promotion")
        fun `handles null AI alt text`() {
            val media = createMedia(altText = "Existing")
            val event = createEvent(altText = null)
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.altText).isEqualTo("Existing")
        }

        @Test
        @DisplayName("Should not save when media not found")
        fun `skips when media not found`() {
            whenever(repository.findById(mediaId)).thenReturn(Optional.empty())

            service.onAiResultsApproved(createEvent())

            verify(repository, never()).save(any())
        }

        @Test
        @DisplayName("Should not save when media is ExternalMedia")
        fun `skips for external media`() {
            val external = ExternalMedia().apply {
                id = mediaId
                title = "External Video"
            }
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(external))

            service.onAiResultsApproved(createEvent())

            verify(repository, never()).save(any())
        }

        @Test
        @DisplayName("Should handle empty tags gracefully")
        fun `handles empty tags`() {
            val media = createMedia()
            val event = createEvent(tags = emptyList())
            whenever(repository.findById(mediaId)).thenReturn(Optional.of(media))

            service.onAiResultsApproved(event)

            assertThat(media.aiTags).isNull()
        }
    }
}
