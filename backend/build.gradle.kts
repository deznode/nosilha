import io.gitlab.arturbosch.detekt.Detekt
import io.gitlab.arturbosch.detekt.DetektCreateBaselineTask
import org.springframework.boot.gradle.tasks.bundling.BootBuildImage

plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.4.7"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "1.9.25"
    jacoco
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
}

group = "com.nosilha"
version = "0.0.2-SNAPSHOT"
description = "Nos Ilha - Community-driven cultural heritage hub for Brava Island, Cape Verde"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

extra["springCloudGcpVersion"] = "6.2.2"
extra["testcontainersVersion"] = "1.21.3"
extra["detektVersion"] = "1.23.8"
extra["kotlinLogging"] = "7.0.3"
extra["springdocOpenApiVersion"] = "2.8.9"
extra["springModulithVersion"] = "1.2.5"

dependencies {

    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:${property("detektVersion")}")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:${property("springdocOpenApiVersion")}")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.google.cloud:spring-cloud-gcp-starter-storage")
    implementation("com.google.cloud:spring-cloud-gcp-starter-data-firestore")
    implementation("com.google.cloud:spring-cloud-gcp-starter-vision")
    implementation("io.github.oshai:kotlin-logging-jvm:${property("kotlinLogging")}")
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("org.postgresql:postgresql")
    implementation(platform("org.testcontainers:testcontainers-bom:${property("testcontainersVersion")}"))

    // Spring Modulith dependencies
    implementation("org.springframework.modulith:spring-modulith-starter-core:${property("springModulithVersion")}")
    implementation("org.springframework.modulith:spring-modulith-starter-jpa:${property("springModulithVersion")}")
    testImplementation("org.springframework.modulith:spring-modulith-starter-test:${property("springModulithVersion")}")

    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

dependencyManagement {
    imports {
        mavenBom("com.google.cloud:spring-cloud-gcp-dependencies:${property("springCloudGcpVersion")}")
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
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
}

// Configure Spring Boot to generate build info for actuator
springBoot {
    buildInfo{}
}

jacoco {
    toolVersion = "0.8.12"
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
                minimum = "0.70".toBigDecimal()
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
        println("See build/modulith/ for generated PlantUML diagrams")
    }
}

dependencyManagement {
    configurations.matching { it.name == "detekt" }.all {
        resolutionStrategy.eachDependency {
            if (requested.group == "org.jetbrains.kotlin") {
                useVersion(
                    io.gitlab.arturbosch.detekt
                        .getSupportedKotlinVersion(),
                )
            }
        }
    }
}

detekt {
    buildUponDefaultConfig = true // preconfigure defaults
    autoCorrect = true // enable auto-correction for formatting rules
    baseline = file("detekt-baseline.xml")
    config.setFrom(file("detekt.yml"))
}

tasks.withType<Detekt>().configureEach {
    jvmTarget = "21"
    reports {
        sarif.required.set(true)
        md.required.set(true)
    }
}
tasks.withType<DetektCreateBaselineTask>().configureEach {
    jvmTarget = "21"
}
