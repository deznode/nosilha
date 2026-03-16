import org.springframework.boot.gradle.tasks.bundling.BootBuildImage

plugins {
    kotlin("jvm") version "2.3.0"
    kotlin("plugin.spring") version "2.3.0"
    id("org.springframework.boot") version "4.0.3"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "2.3.0"
    jacoco
    // TODO: by JC, 12/26/25 - Re-enable detekt when compatible version is released
    // Issue: detekt 2.0.0-alpha.1 compiled with Kotlin 2.2.20, but we need Kotlin 2.3.0 for Java 25 JVM target
    // Solution: Wait for detekt 2.0.0-alpha.2 or stable release compiled with Kotlin 2.3.0
    // New plugin ID: id("dev.detekt") version "2.0.0+" (changed from io.gitlab.arturbosch.detekt)
    // Track: https://github.com/detekt/detekt/releases
    id("org.jlleitschuh.gradle.ktlint") version "14.0.1"
}

group = "com.nosilha"
version = "0.0.2-SNAPSHOT"
description = "Nos Ilha - Community-driven cultural heritage hub for Brava Island, Cape Verde"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
    maven { url = uri("https://repo.spring.io/milestone") }
}

extra["testcontainersVersion"] = "1.21.4"
extra["kotlinLogging"] = "7.0.3"
extra["springdocOpenApiVersion"] = "2.8.9"
extra["springModulithVersion"] = "2.0.1"

// Override Spring Boot's testcontainers version for Docker 29+ compatibility
extra["springAiVersion"] = "2.0.0-M2"

dependencyManagement {
    imports {
        mavenBom("org.testcontainers:testcontainers-bom:${property("testcontainersVersion")}")
        mavenBom("org.springframework.ai:spring-ai-bom:${property("springAiVersion")}")
        // Override Jackson 2.x to fix CVE in async parser DoS (transitive via AWS SDK)
        mavenBom("com.fasterxml.jackson:jackson-bom:2.21.1")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-restclient")
    implementation("org.springframework.boot:spring-boot-starter-cache")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:${property("springdocOpenApiVersion")}")
    implementation("tools.jackson.module:jackson-module-kotlin:3.1.0")
    implementation("io.github.oshai:kotlin-logging-jvm:${property("kotlinLogging")}")
    implementation("org.springframework.boot:spring-boot-starter-flyway")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    developmentOnly("org.springframework.boot:spring-boot-docker-compose")
    runtimeOnly("org.postgresql:postgresql")

    // Cloudflare R2 (S3-compatible) integration
    implementation(platform("software.amazon.awssdk:bom:2.29.51"))
    implementation("software.amazon.awssdk:s3")

    // OWASP HTML Sanitizer for XSS prevention
    implementation("com.googlecode.owasp-java-html-sanitizer:owasp-java-html-sanitizer:20260101.1")

    // Spring Modulith dependencies
    implementation("org.springframework.modulith:spring-modulith-starter-core:${property("springModulithVersion")}")
    implementation("org.springframework.modulith:spring-modulith-starter-jpa:${property("springModulithVersion")}")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test:${property("springModulithVersion")}")

    implementation("com.github.ben-manes.caffeine:caffeine")

    // Bucket4j for efficient in-memory rate limiting (token bucket algorithm)
    implementation("com.bucket4j:bucket4j_jdk17-core:8.14.0")

    // Google Cloud Vision SDK for image analysis (labels, OCR, landmarks)
    implementation("com.google.cloud:google-cloud-vision:3.76.0")

    // Spring AI for Gemini cultural context generation (native structured output)
    implementation("org.springframework.ai:spring-ai-starter-model-google-genai")

    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.4.0")
    testImplementation("org.springframework.boot:spring-boot-webmvc-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xjsr305=strict",
            "-Xannotation-default-target=param-property"
        )
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.getByName<BootBuildImage>("bootBuildImage") {
    imageName.set("us-east1-docker.pkg.dev/nosilha/nosilha-backend/nosilha-core-api:${project.version}")
    // TODO: Enable AppCDS when Paketo fixes Java 25 compatibility (track: paketo-buildpacks/spring-boot#581)
    // environment.set(mapOf("BP_JVM_CDS_ENABLED" to "true"))
}

// Configure Spring Boot to generate build info for actuator
springBoot {
    buildInfo {}
}

// Load environment variables from .env.local for local development
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    doFirst {
        val envFile = file(".env.local")
        if (envFile.exists()) {
            envFile
                .readLines()
                .filter { it.isNotBlank() && !it.startsWith("#") && it.contains("=") }
                .forEach { line ->
                    val (key, value) = line.split("=", limit = 2)
                    environment(key.trim(), value.trim())
                }
            println("Loaded environment from .env.local")
        }
    }
}

jacoco {
    toolVersion = "0.8.14"
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
    finalizedBy(tasks.jacocoTestCoverageVerification)
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.jacocoTestReport)
    violationRules {
        rule {
            limit {
//              minimum = "0.70".toBigDecimal()
                // TODO: by JC, 10/16/25, set to 0.05 for now just to test the CI/CD. we will add more test coverage later
                minimum = "0.05".toBigDecimal()
            }
        }
    }
}

// Spring Modulith documentation generation
tasks.register("generateModulithDocs") {
    group = "documentation"
    description = "Generates Spring Modulith module documentation (PlantUML diagrams)"
    dependsOn(tasks.test)
    doLast {
        println("Spring Modulith documentation will be generated during test execution")
        println("See build/spring-modulith-docs/ for generated PlantUML diagrams")
    }
}

// Ktlint configuration for code formatting
configure<org.jlleitschuh.gradle.ktlint.KtlintExtension> {
    version.set("1.5.0")
    android.set(false)
    ignoreFailures.set(false)
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.PLAIN)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
        // SARIF reporter disabled due to sarif4k compatibility issue with Kotlin 2.2
        // reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.SARIF)
    }
    filter {
        exclude("**/generated/**")
        include("**/kotlin/**")
    }
}

tasks.named("check") {
    dependsOn("ktlintCheck")
}
