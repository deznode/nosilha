package com.nosilha.core.shared.events

import java.time.Instant

/**
 * Base interface for Spring Modulith application module events.
 *
 * <p>Application module events extend DomainEvent and are specifically designed
 * for cross-module communication within a Spring Modulith architecture. These events
 * are published by one module and consumed by other modules via @ApplicationModuleListener.</p>
 *
 * <p><strong>Spring Modulith Integration:</strong></p>
 * <ul>
 *   <li>Events are published via Spring's ApplicationEventPublisher</li>
 *   <li>Events are consumed via @ApplicationModuleListener annotation</li>
 *   <li>Event delivery is asynchronous and transactional</li>
 *   <li>Failed event processing can be retried automatically</li>
 * </ul>
 *
 * <p><strong>Cross-Module Communication Pattern:</strong></p>
 * <pre>
 * {@code
 * // Publishing module (Directory)
 * @Service
 * class DirectoryService(private val eventPublisher: ApplicationEventPublisher) {
 *     fun createEntry(entry: DirectoryEntry): DirectoryEntry {
 *         val saved = repository.save(entry)
 *         eventPublisher.publishEvent(DirectoryEntryCreatedEvent(saved.id!!, saved.category, saved.name))
 *         return saved
 *     }
 * }
 *
 * // Consuming module (Media)
 * @Service
 * class MediaService {
 *     @ApplicationModuleListener
 *     fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
 *         // React to directory entry creation (e.g., create placeholder metadata)
 *     }
 * }
 * }
 * </pre>
 *
 * @see DomainEvent
 * @see org.springframework.context.ApplicationEventPublisher
 * @see org.springframework.modulith.ApplicationModuleListener
 */
interface ApplicationModuleEvent : DomainEvent {
    /**
     * Timestamp when the application module event occurred.
     * Inherited from DomainEvent, defaults to the current instant.
     */
    override val occurredAt: Instant
        get() = Instant.now()
}
