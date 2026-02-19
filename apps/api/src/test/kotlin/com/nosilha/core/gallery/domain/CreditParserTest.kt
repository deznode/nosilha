package com.nosilha.core.gallery.domain

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource

class CreditParserTest {
    @Nested
    @DisplayName("YouTube URL detection")
    inner class YoutubeUrls {
        @Test
        fun `parses youtube com with @ handle`() {
            val result = CreditParser.parseCredit("https://youtube.com/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
            assertThat(result.displayName).isEqualTo("@nosilha")
        }

        @Test
        fun `parses youtube com without @ handle`() {
            val result = CreditParser.parseCredit("https://youtube.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses youtube com with www prefix`() {
            val result = CreditParser.parseCredit("https://www.youtube.com/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses youtube com without protocol`() {
            val result = CreditParser.parseCredit("youtube.com/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("Instagram URL detection")
    inner class InstagramUrls {
        @Test
        fun `parses instagram com URL`() {
            val result = CreditParser.parseCredit("https://instagram.com/nosilha_cv")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha_cv")
            assertThat(result.displayName).isEqualTo("@nosilha_cv")
        }

        @Test
        fun `parses instagram com with www`() {
            val result = CreditParser.parseCredit("https://www.instagram.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("Facebook URL detection")
    inner class FacebookUrls {
        @Test
        fun `parses facebook com URL`() {
            val result = CreditParser.parseCredit("https://facebook.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.FACEBOOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses fb com shorthand URL`() {
            val result = CreditParser.parseCredit("https://fb.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.FACEBOOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("Twitter/X URL detection")
    inner class TwitterUrls {
        @Test
        fun `parses x com URL`() {
            val result = CreditParser.parseCredit("https://x.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TWITTER)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses twitter com URL`() {
            val result = CreditParser.parseCredit("https://twitter.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TWITTER)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("TikTok URL detection")
    inner class TiktokUrls {
        @Test
        fun `parses tiktok com URL with @ handle`() {
            val result = CreditParser.parseCredit("https://tiktok.com/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TIKTOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses tiktok com URL without @`() {
            val result = CreditParser.parseCredit("https://tiktok.com/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TIKTOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("Shorthand detection")
    inner class Shorthands {
        @Test
        fun `parses youtube shorthand`() {
            val result = CreditParser.parseCredit("youtube/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses yt shorthand`() {
            val result = CreditParser.parseCredit("yt/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses ig shorthand`() {
            val result = CreditParser.parseCredit("ig/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses fb shorthand`() {
            val result = CreditParser.parseCredit("fb/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.FACEBOOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses x shorthand`() {
            val result = CreditParser.parseCredit("x/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TWITTER)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `parses tiktok shorthand`() {
            val result = CreditParser.parseCredit("tiktok/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.TIKTOK)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `shorthand without @ also works`() {
            val result = CreditParser.parseCredit("ig/nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("URL cleanup")
    inner class UrlCleanup {
        @Test
        fun `strips query parameters`() {
            val result = CreditParser.parseCredit("https://instagram.com/nosilha?igsh=abc123")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `strips trailing slash`() {
            val result = CreditParser.parseCredit("https://instagram.com/nosilha/")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `strips both trailing slash and query params`() {
            val result = CreditParser.parseCredit("https://youtube.com/@nosilha/?sub=1")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `normalizes handle to lowercase`() {
            val result = CreditParser.parseCredit("https://instagram.com/NosIlha")
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }

    @Nested
    @DisplayName("Plain name fallback")
    inner class PlainNames {
        @Test
        fun `returns plain name when no platform detected`() {
            val result = CreditParser.parseCredit("João Silva")
            assertThat(result.platform).isNull()
            assertThat(result.handle).isNull()
            assertThat(result.displayName).isEqualTo("João Silva")
        }

        @Test
        fun `preserves original display name casing`() {
            val result = CreditParser.parseCredit("Maria da Luz")
            assertThat(result.displayName).isEqualTo("Maria da Luz")
        }

        @Test
        fun `handles single word names`() {
            val result = CreditParser.parseCredit("Cesária")
            assertThat(result.platform).isNull()
            assertThat(result.displayName).isEqualTo("Cesária")
        }
    }

    @Nested
    @DisplayName("Edge cases")
    inner class EdgeCases {
        @ParameterizedTest
        @ValueSource(strings = ["", "   ", "\t", "\n"])
        fun `returns empty display name for blank input`(input: String) {
            val result = CreditParser.parseCredit(input)
            assertThat(result.displayName).isEmpty()
            assertThat(result.platform).isNull()
            assertThat(result.handle).isNull()
        }

        @Test
        fun `trims whitespace from input`() {
            val result = CreditParser.parseCredit("  https://instagram.com/nosilha  ")
            assertThat(result.platform).isEqualTo(CreditPlatform.INSTAGRAM)
            assertThat(result.handle).isEqualTo("nosilha")
        }

        @Test
        fun `unknown shorthand prefix falls back to plain name`() {
            val result = CreditParser.parseCredit("linkedin/@nosilha")
            assertThat(result.platform).isNull()
            assertThat(result.displayName).isEqualTo("linkedin/@nosilha")
        }

        @Test
        fun `http URL without s works`() {
            val result = CreditParser.parseCredit("http://youtube.com/@nosilha")
            assertThat(result.platform).isEqualTo(CreditPlatform.YOUTUBE)
            assertThat(result.handle).isEqualTo("nosilha")
        }
    }
}
