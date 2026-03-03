package com.nosilha.core

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(
    excludeName = ["org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration"],
)
class NosIlhaCoreApplication

fun main(args: Array<String>) {
    runApplication<NosIlhaCoreApplication>(*args)
}
