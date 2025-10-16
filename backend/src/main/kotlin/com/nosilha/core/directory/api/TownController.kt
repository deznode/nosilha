package com.nosilha.core.directory.api

import com.nosilha.core.shared.api.ApiResponse
import com.nosilha.core.shared.api.PagedApiResponse
import com.nosilha.core.shared.api.TownDto
import com.nosilha.core.directory.domain.TownService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

/**
 * REST controller for accessing town/village information on Brava Island.
 *
 * This controller exposes a versioned API (v1) for retrieving information
 * about towns and villages, which serve as geographic containers for directory entries.
 *
 * @param service The business logic layer for town operations.
 */
@RestController
@RequestMapping("/api/v1/towns")
class TownController(
    private val service: TownService,
) {
    /**
     * Retrieves a list of all towns with optional pagination support.
     *
     * @param page Page number (default: 0).
     * @param size Page size (default: 20).
     * @return A PagedApiResponse with data containing the list of [TownDto] objects.
     */
    @GetMapping
    fun getTowns(
        @RequestParam(name = "page", defaultValue = "0") page: Int,
        @RequestParam(name = "size", defaultValue = "20") size: Int,
    ): PagedApiResponse<TownDto> {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by("name").ascending())
        val resultPage = service.getTownsPage(pageable)
        return PagedApiResponse.from(resultPage)
    }

    /**
     * Retrieves all towns without pagination, ordered by name.
     *
     * This endpoint is useful for dropdowns, maps, and other UI components
     * that need the complete list of towns.
     *
     * @return An ApiResponse containing all towns ordered by name.
     */
    @GetMapping("/all")
    fun getAllTowns(): ApiResponse<List<TownDto>> {
        val towns = service.getAllTowns()
        return ApiResponse(data = towns)
    }

    /**
     * Retrieves a single town by its unique identifier.
     *
     * @param id The UUID of the town to retrieve.
     * @return The ApiResponse wrapping [TownDto] with a 200 OK status.
     * If the town is not found, the service will throw an exception that results
     * in a 404 Not Found status.
     */
    @GetMapping("/{id}")
    fun getTownById(
        @PathVariable id: UUID,
    ): ApiResponse<TownDto> {
        val town = service.getTownById(id)
        return ApiResponse(data = town)
    }

    /**
     * Retrieves a single town by its unique slug.
     *
     * This endpoint provides a user-friendly way to access towns
     * using human-readable slugs instead of UUIDs. For example:
     * GET /api/v1/towns/slug/nova-sintra
     *
     * @param slug The unique slug of the town to retrieve.
     * @return The ApiResponse wrapping [TownDto] with a 200 OK status.
     * If the town is not found, the service will throw an exception that results
     * in a 404 Not Found status.
     */
    @GetMapping("/slug/{slug}")
    fun getTownBySlug(
        @PathVariable slug: String,
    ): ApiResponse<TownDto> {
        val town = service.getTownBySlug(slug)
        return ApiResponse(data = town)
    }

    /**
     * Creates a new town.
     *
     * This endpoint handles `POST` requests to `/api/v1/towns`.
     * The `@ResponseStatus(HttpStatus.CREATED)` annotation ensures a 201 status is returned on success.
     *
     * @param request The request body containing the details of the town to create.
     * @return The ApiResponse wrapping the DTO of the newly created town.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTown(
        @RequestBody request: CreateTownRequestDto,
    ): ApiResponse<TownDto> {
        val createdTown = service.createTown(
            name = request.name,
            description = request.description,
            latitude = request.latitude,
            longitude = request.longitude,
            population = request.population,
            elevation = request.elevation,
            founded = request.founded,
            highlights = request.highlights ?: emptyList(),
            heroImage = request.heroImage,
            gallery = request.gallery ?: emptyList()
        )
        return ApiResponse(data = createdTown, status = HttpStatus.CREATED.value())
    }

    /**
     * Updates an existing town.
     *
     * @param id The UUID of the town to update.
     * @param request The request body containing the updated town data.
     * @return The ApiResponse wrapping the updated [TownDto].
     */
    @PutMapping("/{id}")
    fun updateTown(
        @PathVariable id: UUID,
        @RequestBody request: CreateTownRequestDto,
    ): ApiResponse<TownDto> {
        val updatedTown = service.updateTown(
            id = id,
            name = request.name,
            description = request.description,
            latitude = request.latitude,
            longitude = request.longitude,
            population = request.population,
            elevation = request.elevation,
            founded = request.founded,
            highlights = request.highlights ?: emptyList(),
            heroImage = request.heroImage,
            gallery = request.gallery ?: emptyList()
        )
        return ApiResponse(data = updatedTown)
    }

    /**
     * Deletes a town by its ID.
     *
     * @param id The UUID of the town to delete.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTown(
        @PathVariable id: UUID,
    ) {
        service.deleteTown(id)
    }
}

/**
 * Request DTO for creating or updating a town.
 */
data class CreateTownRequestDto(
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val population: String? = null,
    val elevation: String? = null,
    val founded: String? = null,
    val highlights: List<String>? = null,
    val heroImage: String? = null,
    val gallery: List<String>? = null
)
