package com.nosilha.core.gallery.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@DisplayName("ImageDimensions")
class ImageDimensionsTest {
    private fun encode(
        format: String,
        width: Int,
        height: Int,
    ): ByteArray =
        ByteArrayOutputStream().use { out ->
            ImageIO.write(BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), format, out)
            out.toByteArray()
        }

    @Test
    fun `reads a PNG's size from its header`() {
        assertThat(ImageDimensions.read(encode("png", 12, 7))).isEqualTo(PixelSize(12, 7))
    }

    @Test
    fun `reads a JPEG's size from its header`() {
        assertThat(ImageDimensions.read(encode("jpg", 30, 20))).isEqualTo(PixelSize(30, 20))
    }

    @Test
    fun `bytes that end before the size is declared read as unknown`() {
        assertThat(ImageDimensions.read(encode("png", 12, 7).copyOf(12))).isNull()
    }

    @Test
    fun `bytes of no known image format read as unknown`() {
        assertThat(ImageDimensions.read("not an image".toByteArray())).isNull()
    }

    @Test
    fun `quarter-turn orientations swap width and height`() {
        val stored = PixelSize(12, 7)

        listOf(5, 6, 7, 8).forEach { assertThat(ImageDimensions.displayed(stored, it)).isEqualTo(PixelSize(7, 12)) }
        listOf(1, 2, 3, 4).forEach { assertThat(ImageDimensions.displayed(stored, it)).isEqualTo(stored) }
        assertThat(ImageDimensions.displayed(stored, null)).isEqualTo(stored)
    }
}
