package com.nosilha.core.places.repository

import com.nosilha.core.places.domain.DirectoryEntry
import org.springframework.data.jpa.domain.Specification

/**
 * Provides reusable Spring Data JPA Specifications for dynamic filtering of DirectoryEntry entities.
 *
 * <p>This class follows the Specification pattern to build type-safe, composable queries
 * that can be combined using logical operators (AND, OR) for complex filtering scenarios.</p>
 *
 * <p><strong>Usage Example:</strong></p>
 * <pre>
 * {@code
 * val spec = Specification.where(DirectoryEntrySpecifications.hasCategory("Restaurant"))
 *     .and(DirectoryEntrySpecifications.hasTown("Nova Sintra"))
 *
 * val results = repository.findAll(spec)
 * }
 * </pre>
 *
 * <p><strong>Supported Filters:</strong></p>
 * <ul>
 *   <li>Category filtering (case-insensitive)</li>
 *   <li>Town/location filtering (case-insensitive)</li>
 * </ul>
 *
 * @see org.springframework.data.jpa.domain.Specification
 * @see DirectoryEntryRepository
 */
object DirectoryEntrySpecifications {
    /**
     * Creates a specification to filter directory entries by category.
     *
     * <p>Performs a case-insensitive match on the category discriminator column.
     * This leverages the Single Table Inheritance pattern to filter by entity type.</p>
     *
     * @param category The category name to filter by (e.g., "Restaurant", "Hotel", "Beach", "Landmark")
     * @return A Specification that filters entries matching the given category
     */
    fun hasCategory(category: String): Specification<DirectoryEntry> =
        Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(
                criteriaBuilder.lower(root.get<String>("category")),
                category.lowercase(),
            )
        }

    /**
     * Creates a specification to filter directory entries by town.
     *
     * <p>Performs a case-insensitive match on the town field, allowing users
     * to filter entries by geographic location.</p>
     *
     * @param town The town name to filter by (e.g., "Nova Sintra", "Faja de Agua")
     * @return A Specification that filters entries matching the given town
     */
    fun hasTown(town: String): Specification<DirectoryEntry> =
        Specification { root, _, criteriaBuilder ->
            criteriaBuilder.equal(
                criteriaBuilder.lower(root.get<String>("town")),
                town.lowercase(),
            )
        }
}
