package com.nosilha.core.gallery.domain

import java.io.ByteArrayInputStream
import javax.imageio.ImageIO

/** An image's size in pixels. */
data class PixelSize(
    val width: Int,
    val height: Int,
)

/**
 * Reads image dimensions from header bytes (spec 034 FR-019 backfill).
 *
 * Uses the JDK's image readers, which cover JPEG, PNG, GIF and BMP; WebP is not read.
 */
object ImageDimensions {
    /**
     * Reads width and height as stored in the file, without decoding pixels.
     *
     * @return the stored size, or null when no reader knows the format or the bytes end
     *   before the size is declared
     */
    @Suppress("TooGenericExceptionCaught")
    fun read(bytes: ByteArray): PixelSize? {
        val stream = ImageIO.createImageInputStream(ByteArrayInputStream(bytes)) ?: return null
        stream.use {
            val readers = ImageIO.getImageReaders(stream)
            if (!readers.hasNext()) return null
            val reader = readers.next()
            return try {
                reader.setInput(stream, true, true)
                PixelSize(reader.getWidth(0), reader.getHeight(0))
            } catch (_: Exception) {
                // Truncated or corrupt headers surface as IIOException or runtime errors
                null
            } finally {
                reader.dispose()
            }
        }
    }

    /**
     * The size as displayed. EXIF orientations 5 to 8 turn the image a quarter, so the
     * stored width is the displayed height. Browsers apply orientation, and uploads
     * record the size the browser shows.
     */
    fun displayed(
        stored: PixelSize,
        orientation: Int?,
    ): PixelSize = if (orientation != null && orientation in 5..8) PixelSize(stored.height, stored.width) else stored
}
