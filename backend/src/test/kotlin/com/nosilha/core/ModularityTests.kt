package com.nosilha.core

import org.junit.jupiter.api.Test
import org.springframework.modulith.core.ApplicationModules
import org.springframework.modulith.docs.Documenter

/**
 * Contract Test T014: Spring Modulith Module Structure
 *
 * These contract tests verify that the backend follows the modular architecture
 * specified in research.md and data-model.md using Spring Modulith.
 *
 * IMPORTANT: This test is designed to FAIL initially (TDD approach).
 * It will pass once Phase 3 (Backend Spring Modulith) is implemented (T059-T089).
 *
 * Requirements:
 * - FR-004: Module boundaries must be enforced
 * - FR-009: Zero circular dependencies
 *
 * Expected Modules:
 * - shared (Shared Kernel) - No dependencies
 * - auth (Authentication Module) - Depends on: shared only
 * - directory (Directory Module) - Depends on: shared only
 * - media (Media Module) - Depends on: shared only
 *
 * Status: Expected to FAIL until modules are extracted in Phase 3
 */
class ModularityTests {

    private val modules = ApplicationModules.of("com.nosilha.core")

    /**
     * Contract Test: Verify module structure passes Spring Modulith validation
     *
     * This test verifies:
     * 1. All modules are correctly defined with @ApplicationModule
     * 2. Module dependencies are declared correctly
     * 3. No circular dependencies exist
     * 4. Module boundaries are respected (no unauthorized cross-module imports)
     *
     * Expected to FAIL until Phase 3 module extraction is complete.
     */
    @Test
    fun `verify module structure`() {
        try {
            // This will fail initially because modules are not yet extracted
            modules.verify()

            // If verification passes, log the module structure
            println("✅ Module structure verification passed!")
            println("Detected modules:")
            modules.forEach { module ->
                println("  - ${module.name}")
                println("    Dependencies: ${module.dependencies.joinToString(", ") { it.name }}")
            }
        } catch (e: Exception) {
            println("❌ Module structure verification failed (expected in TDD approach)")
            println("Error: ${e.message}")
            throw AssertionError(
                """
                Module structure does not pass Spring Modulith verification.

                This is expected before Phase 3 (Backend Spring Modulith) implementation.

                To fix:
                1. Extract shared kernel module (T061-T064)
                2. Extract auth module (T065-T070)
                3. Extract directory module (T071-T079)
                4. Extract media module (T080-T083)
                5. Configure module package-info.java files with @ApplicationModule

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }

    /**
     * Contract Test: Generate module documentation
     *
     * This test generates PlantUML diagrams showing:
     * - Module dependencies
     * - Event-driven communication between modules
     * - Public APIs exposed by each module
     *
     * Expected to FAIL until modules are properly structured.
     */
    @Test
    fun `generate module documentation`() {
        try {
            val documenter = Documenter(modules)

            // Generate comprehensive module documentation
            documenter
                .writeModulesAsPlantUml() // Overall module diagram
                .writeIndividualModulesAsPlantUml() // Individual module details

            println("✅ Module documentation generated successfully!")
            println("Check build/modulith/ directory for PlantUML diagrams")
        } catch (e: Exception) {
            println("❌ Module documentation generation failed (expected in TDD approach)")
            println("Error: ${e.message}")
            throw AssertionError(
                """
                Failed to generate module documentation.

                This is expected before Phase 3 implementation.

                Documentation will be automatically generated once:
                - Module structure is validated
                - @ApplicationModule annotations are in place
                - Module boundaries are properly defined

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }

    /**
     * Contract Test: Verify shared kernel has no dependencies
     *
     * The shared kernel should be the foundation layer with zero dependencies
     * on other application modules.
     *
     * Expected to FAIL until shared kernel is extracted (T061-T064).
     */
    @Test
    fun `verify shared kernel has no dependencies`() {
        try {
            val sharedModule = modules.getModuleByName("shared")
                .orElseThrow { AssertionError("Shared kernel module not found") }

            val dependencies = sharedModule.dependencies

            if (dependencies.isNotEmpty()) {
                throw AssertionError(
                    """
                    Shared kernel should have ZERO dependencies.
                    Found dependencies: ${dependencies.joinToString(", ") { it.name }}
                    """.trimIndent()
                )
            }

            println("✅ Shared kernel has no dependencies (correct)")
        } catch (e: Exception) {
            println("❌ Shared kernel verification failed (expected in TDD approach)")
            throw AssertionError(
                """
                Shared kernel module not found or has incorrect dependencies.

                Expected in Phase 3.2 (T061-T064):
                - Create shared kernel module
                - Move AuditableEntity to shared.domain
                - Create base event interfaces
                - Ensure ZERO dependencies on other modules

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }

    /**
     * Contract Test: Verify auth module boundaries
     *
     * Auth module should:
     * - Depend only on shared kernel
     * - Expose security configuration
     * - Publish authentication events
     *
     * Expected to FAIL until auth module is extracted (T065-T070).
     */
    @Test
    fun `verify auth module boundaries`() {
        try {
            val authModule = modules.getModuleByName("auth")
                .orElseThrow { AssertionError("Auth module not found") }

            // Verify dependencies
            val dependencies = authModule.dependencies
            val dependencyNames = dependencies.map { it.name }.toSet()

            if (dependencyNames != setOf("shared")) {
                throw AssertionError(
                    """
                    Auth module should depend ONLY on shared kernel.
                    Found dependencies: ${dependencyNames.joinToString(", ")}
                    """.trimIndent()
                )
            }

            println("✅ Auth module boundaries correct")
        } catch (e: Exception) {
            println("❌ Auth module verification failed (expected in TDD approach)")
            throw AssertionError(
                """
                Auth module not found or has incorrect boundaries.

                Expected in Phase 3.3 (T065-T070):
                - Create auth module with @ApplicationModule annotation
                - Move authentication classes to auth module
                - Define allowedDependencies = ["shared"]

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }

    /**
     * Contract Test: Verify directory module boundaries
     *
     * Directory module should:
     * - Depend only on shared kernel
     * - Expose REST controllers
     * - Publish directory entry events
     *
     * Expected to FAIL until directory module is extracted (T071-T079).
     */
    @Test
    fun `verify directory module boundaries`() {
        try {
            val directoryModule = modules.getModuleByName("directory")
                .orElseThrow { AssertionError("Directory module not found") }

            val dependencies = directoryModule.dependencies
            val dependencyNames = dependencies.map { it.name }.toSet()

            if (dependencyNames != setOf("shared")) {
                throw AssertionError(
                    """
                    Directory module should depend ONLY on shared kernel.
                    Found dependencies: ${dependencyNames.joinToString(", ")}
                    """.trimIndent()
                )
            }

            println("✅ Directory module boundaries correct")
        } catch (e: Exception) {
            println("❌ Directory module verification failed (expected in TDD approach)")
            throw AssertionError(
                """
                Directory module not found or has incorrect boundaries.

                Expected in Phase 3.4 (T071-T079):
                - Create directory module with @ApplicationModule annotation
                - Move DirectoryEntry and subclasses to directory.domain
                - Move DirectoryService to directory.domain
                - Move DirectoryController to directory.api
                - Define allowedDependencies = ["shared"]

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }

    /**
     * Contract Test: Verify media module listens to directory events
     *
     * Media module should:
     * - Depend only on shared kernel
     * - Listen to DirectoryEntryCreatedEvent
     * - Publish media processing events
     *
     * Expected to FAIL until media module is extracted (T080-T083).
     */
    @Test
    fun `verify media module boundaries`() {
        try {
            val mediaModule = modules.getModuleByName("media")
                .orElseThrow { AssertionError("Media module not found") }

            val dependencies = mediaModule.dependencies
            val dependencyNames = dependencies.map { it.name }.toSet()

            if (dependencyNames != setOf("shared")) {
                throw AssertionError(
                    """
                    Media module should depend ONLY on shared kernel.
                    Found dependencies: ${dependencyNames.joinToString(", ")}
                    """.trimIndent()
                )
            }

            println("✅ Media module boundaries correct")
        } catch (e: Exception) {
            println("❌ Media module verification failed (expected in TDD approach)")
            throw AssertionError(
                """
                Media module not found or has incorrect boundaries.

                Expected in Phase 3.5 (T080-T083):
                - Create media module with @ApplicationModule annotation
                - Create MediaService with @ApplicationModuleListener
                - Listen to DirectoryEntryCreatedEvent
                - Define allowedDependencies = ["shared"]

                Current error: ${e.message}
                """.trimIndent(),
                e
            )
        }
    }
}
