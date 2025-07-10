package com.nosilha.core

import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@Disabled("Need to run this tests")
@ActiveProfiles("test")
@SpringBootTest
class CoreApplicationTests {
    @Test
    fun contextLoads() {
    }
}
