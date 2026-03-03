package com.nosilha.core.shared.events

import java.time.Instant

/**
 * Base interface for all domain events in the Nos Ilha platform.
 *
 * <p>Domain events represent significant occurrences within the business domain
 * that other parts of the system may need to react to. Events follow an event-driven
 * architecture pattern, enabling loose coupling between modules.</p>
 *
 * <p><strong>Design Principles:</strong></p>
 * <ul>
 *   <li>Events are immutable—represent facts that have already happened</li>
 *   <li>Events are named in past tense (e.g., DirectoryEntryCreatedEvent)</li>
 *   <li>Events contain only the data needed for consumers to react</li>
 *   <li>Events include an occurredAt timestamp for audit trails</li>
 * </ul>
 *
 * <p><strong>Usage:</strong></p>
 * <pre>
 * {@code
 * data class DirectoryEntryCreatedEvent(
 *     val entryId: UUID,
 *     val category: String,
 *     val name: String,
 *     override val occurredAt: Instant = Instant.now()
 * ) : DomainEvent
 * }
 * </pre>
 *
 * @see ApplicationModuleEvent
 */
interface DomainEvent {
    /**
     * Timestamp when the domain event occurred.
     * Defaults to the current instant when the event is created.
     */
    val occurredAt: Instant
        get() = Instant.now()
}
