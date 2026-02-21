# Spring Modulith Event Testing Best Practices

**Research Date:** 2026-02-07
**Focus:** Spring Boot 4.0 / Spring Modulith 2.0+ (2025-2026 patterns)
**Topic:** Testing `@ApplicationModuleListener` event handlers with transaction boundaries

---

## Executive Summary

Testing Spring Modulith's `@ApplicationModuleListener` requires understanding its transaction semantics: **events are processed asynchronously in a NEW transaction after the publishing transaction commits**. This creates unique testing challenges around transaction boundaries, timing, and state verification.

**Key Insight:** Spring Modulith 1.1+ provides the `Scenario` API specifically designed to handle these complexities, offering a fluent DSL that manages transactions, event publication, asynchronous waiting, and assertions in a cohesive way.

---

## 1. Transaction Boundary Issues

### Understanding @ApplicationModuleListener Semantics

The `@ApplicationModuleListener` annotation is syntactic sugar that combines:

```kotlin
@Async
@TransactionalEventListener
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

**What this means:**
1. **Asynchronous execution**: Listener runs on a separate thread
2. **Post-commit trigger**: Listener only fires AFTER the publishing transaction commits
3. **New transaction**: Listener runs in its own transaction (REQUIRES_NEW)
4. **Decoupling**: Original business transaction completes before integration starts

### Why This Matters for Testing

**Problem 1: Test transactions don't commit**
```kotlin
@Test
@Transactional // ❌ Common mistake
fun testEventHandler() {
    // Publish event
    eventPublisher.publishEvent(MyEvent())

    // Listener NEVER fires because test transaction never commits!
    // Test rolls back at end
}
```

**Problem 2: Timing issues with assertions**
```kotlin
@Test
fun testEventHandler() {
    eventPublisher.publishEvent(MyEvent())

    // ❌ Assertion happens immediately, but listener runs async
    val result = repository.findById(id)
    assertThat(result).isNotNull() // Fails due to race condition
}
```

**Problem 3: Separate transaction context**
```kotlin
@ApplicationModuleListener
fun onEvent(event: MyEvent) {
    val entity = repository.findById(event.id)
    entity.process() // Runs in NEW transaction
    repository.save(entity)
} // Transaction commits here

// Test code cannot "see" uncommitted changes from listener's transaction
```

### Solution Pattern: TransactionTemplate

To ensure events are published properly, wrap publication in a transaction callback:

```kotlin
@Test
fun testEventHandler() {
    // Force transaction commit so listener fires
    transactionTemplate.execute {
        eventPublisher.publishEvent(MyEvent())
    }

    // Now use Awaitility to wait for async processing
    await().atMost(Duration.ofSeconds(5))
        .untilAsserted {
            val result = repository.findById(id)
            assertThat(result.status).isEqualTo(PROCESSED)
        }
}
```

---

## 2. Common Pitfalls with Spring Modulith Event Testing

### Pitfall 1: Using @Transactional on Test Methods

```kotlin
@SpringBootTest
class MyModuleTest {

    @Test
    @Transactional // ❌ WRONG: Prevents listener from firing
    fun testEventFlow() {
        service.createOrder(orderId)
        // @ApplicationModuleListener never invoked!
    }
}
```

**Why it fails:** The test transaction never commits (it rolls back at test end), so `@TransactionalEventListener` never triggers.

**Fix:** Remove `@Transactional` from test OR use `TransactionTemplate` explicitly.

### Pitfall 2: Forgetting Async Nature

```kotlin
@Test
fun testEventFlow() {
    transactionTemplate.execute {
        eventPublisher.publishEvent(OrderCreated(orderId))
    }

    // ❌ WRONG: Immediate assertion
    assertThat(shipmentRepository.exists(orderId)).isTrue()
}
```

**Fix:** Use Awaitility or Spring Modulith's `Scenario` API.

### Pitfall 3: EntityManager Flush/Clear Confusion

```kotlin
@ApplicationModuleListener
fun onEvent(event: MyEvent) {
    val entity = repository.findById(event.id)
    entity.update()
    repository.save(entity)
    // Each listener runs in REQUIRES_NEW - has its own EntityManager
}

@Test
fun testEventFlow() {
    transactionTemplate.execute {
        entityManager.flush() // ❌ This doesn't help
        entityManager.clear() // ❌ Neither does this
        eventPublisher.publishEvent(event)
    }
    // Listener runs in DIFFERENT transaction with DIFFERENT EntityManager
}
```

**Key concept:** EntityManager operations in the test don't affect the listener's separate transaction context.

### Pitfall 4: Missing @EnableAsync Configuration

```kotlin
@ApplicationModuleListener // Uses @Async internally
fun onEvent(event: MyEvent) { }
```

**Required in main application class:**
```kotlin
@SpringBootApplication
@EnableAsync // ❌ Often forgotten!
class MyApplication
```

Without `@EnableAsync`, listeners run synchronously in the same transaction, defeating the purpose of `@ApplicationModuleListener`.

---

## 3. Best Practice: Testing Event-Driven Orchestrators

### Scenario: Orchestrator Pattern

```kotlin
@Service
class MediaAnalysisOrchestrator(
    private val mediaRepository: UserUploadedMediaRepository,
    private val analysisRepository: MediaAnalysisJobRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    @ApplicationModuleListener
    fun onMediaAnalysisRequested(event: MediaAnalysisRequestedEvent) {
        // 1. Load entity from database
        val media = mediaRepository.findById(event.mediaId)
            ?: throw IllegalStateException("Media not found")

        // 2. Update state
        val job = MediaAnalysisJob(
            mediaId = media.id,
            status = AnalysisStatus.PENDING
        )
        analysisRepository.save(job)

        // 3. Publish new event
        eventPublisher.publishEvent(
            AnalysisJobCreatedEvent(job.id, media.id)
        )
    }
}
```

### Integration Test with Scenario API

```kotlin
@ApplicationModuleTest
class MediaAnalysisOrchestratorTest(
    @Autowired private val mediaRepository: UserUploadedMediaRepository,
    @Autowired private val analysisRepository: MediaAnalysisJobRepository
) {

    @Test
    fun `should create analysis job when media analysis requested`(
        scenario: Scenario
    ) {
        // Arrange: Create test data
        val mediaId = createTestMedia()

        // Act & Assert: Use Scenario API
        scenario
            .publish(MediaAnalysisRequestedEvent(mediaId))
            .andWaitForEventOfType(AnalysisJobCreatedEvent::class.java)
            .matching { it.mediaId == mediaId }
            .toArriveAndVerify { event ->
                // Verify database state
                val job = analysisRepository.findById(event.jobId)
                assertThat(job).isNotNull
                assertThat(job?.status).isEqualTo(AnalysisStatus.PENDING)
            }
    }

    private fun createTestMedia(): UUID {
        // Must create in separate transaction so listener can read it
        return TransactionTemplate(transactionManager).execute {
            val media = UserUploadedMedia(/* ... */)
            mediaRepository.save(media)
            media.id
        }!!
    }
}
```

### Manual Test (Without Scenario API)

```kotlin
@SpringBootTest
class MediaAnalysisOrchestratorManualTest(
    @Autowired private val transactionTemplate: TransactionTemplate,
    @Autowired private val eventPublisher: ApplicationEventPublisher,
    @Autowired private val publishedEvents: PublishedEvents,
    @Autowired private val analysisRepository: MediaAnalysisJobRepository
) {

    @Test
    fun `should create analysis job when media analysis requested`() {
        // Arrange
        val mediaId = createTestMediaInTransaction()

        // Act: Publish in transaction
        transactionTemplate.execute {
            eventPublisher.publishEvent(
                MediaAnalysisRequestedEvent(mediaId)
            )
        }

        // Assert: Wait for async processing
        await()
            .atMost(Duration.ofSeconds(5))
            .untilAsserted {
                val jobs = analysisRepository.findByMediaId(mediaId)
                assertThat(jobs).hasSize(1)
                assertThat(jobs[0].status).isEqualTo(AnalysisStatus.PENDING)
            }

        // Assert: Verify event published
        await()
            .atMost(Duration.ofSeconds(5))
            .untilAsserted {
                val events = publishedEvents.ofType(AnalysisJobCreatedEvent::class.java)
                assertThat(events)
                    .hasSize(1)
                    .anyMatch { it.mediaId == mediaId }
            }
    }
}
```

---

## 4. Spring Modulith Scenario API

### Overview

The `Scenario` API (introduced in Spring Modulith 1.1, refined in 1.3+, stable in 2.0+) provides a **declarative DSL** for testing event-driven flows.

**Key features:**
- Automatic transaction management
- Built-in async waiting with configurable timeouts
- Event filtering and matching
- State change verification
- Cleanup callbacks

### Scenario Lifecycle

```
1. STIMULUS → 2. CUSTOMIZE → 3. OUTCOME → 4. VERIFY
```

1. **Stimulus**: How to start the test (event publication or bean method call)
2. **Customize**: Configure timeouts, wait conditions
3. **Outcome**: What to wait for (event arrival or state change)
4. **Verify**: Assertions on the outcome

### Usage Pattern

```kotlin
@ApplicationModuleTest
class MyModuleTest {

    @Test
    fun testEventFlow(scenario: Scenario) {
        scenario
            // 1. STIMULUS: Publish event
            .publish(OrderCreated(orderId))

            // 2. CUSTOMIZE: Set timeout
            .andWaitAtMost(Duration.ofSeconds(3))

            // 3. OUTCOME: Wait for specific event
            .andWaitForEventOfType(ShipmentCreated::class.java)
            .matching { it.orderId == orderId }

            // 4. VERIFY: Assert on outcome
            .toArriveAndVerify { event ->
                val shipment = shipmentRepository.findById(event.shipmentId)
                assertThat(shipment).isNotNull()
            }
    }
}
```

### Stimulus Options

**Option 1: Event Publication**
```kotlin
scenario.publish(MyEvent(data))
```

**Option 2: Bean Method Invocation**
```kotlin
scenario.stimulate { orderService.completeOrder(orderId) }
```

**Option 3: Bean Method with Result**
```kotlin
scenario.stimulate { orderService.createOrder(request) }
    .andWaitForStateChange { orderService.getOrder(orderId) }
    .andVerify { order -> assertThat(order.status).isEqualTo(COMPLETED) }
```

### Outcome Options

**Wait for Event:**
```kotlin
.andWaitForEventOfType(OrderCompleted::class.java)
```

**Wait for Event with Filtering:**
```kotlin
.andWaitForEventOfType(OrderCompleted::class.java)
.matching { it.orderId == orderId && it.status == COMPLETED }
```

**Wait for State Change:**
```kotlin
.andWaitForStateChange { repository.count() }
.andVerify { count -> assertThat(count).isEqualTo(5) }
```

**Wait for Multiple Events:**
```kotlin
.andWaitForEventOfType(InventoryReserved::class.java)
.matching { it.orderId == orderId }
.toArriveAndVerify { /* ... */ }

// Chain another wait
scenario.publish(NextEvent())
    .andWaitForEventOfType(AnotherEvent::class.java)
    // ...
```

### Advanced Customization

**Custom Timeout:**
```kotlin
scenario
    .publish(event)
    .andWaitAtMost(Duration.ofSeconds(10))
    .andWaitForEventOfType(MyEvent::class.java)
    // ...
```

**Custom Awaitility Configuration:**
```kotlin
scenario
    .publish(event)
    .customize { conditionFactory ->
        conditionFactory
            .atMost(Duration.ofSeconds(5))
            .pollInterval(Duration.ofMillis(100))
            .pollDelay(Duration.ofMillis(50))
    }
    .andWaitForEventOfType(MyEvent::class.java)
    // ...
```

**Cleanup Callbacks:**
```kotlin
scenario
    .publish(event)
    .andCleanup {
        // Runs after test completion (success or failure)
        repository.deleteAll()
    }
    .andWaitForEventOfType(MyEvent::class.java)
    // ...
```

### Complex Scenario Example

```kotlin
@Test
fun `complete order flow with inventory and notification`(
    scenario: Scenario
) {
    // Setup test data in transaction
    val orderId = createTestOrder()
    val customerId = createTestCustomer()

    scenario
        // Step 1: Complete order
        .stimulate { orderService.complete(orderId) }

        // Step 2: Wait for inventory reservation
        .andWaitAtMost(Duration.ofSeconds(3))
        .andWaitForEventOfType(InventoryReserved::class.java)
        .matching { it.orderId == orderId }
        .toArriveAndVerify { event ->
            val inventory = inventoryRepository.findByProduct(event.productId)
            assertThat(inventory.reserved).isGreaterThan(0)
        }

    // Step 3: Verify notification sent (chained scenario)
    scenario
        .publish(OrderCompleted(orderId, customerId))
        .andWaitForEventOfType(NotificationSent::class.java)
        .matching { it.customerId == customerId }
        .toArriveAndVerify { event ->
            assertThat(event.channel).isEqualTo(NotificationChannel.EMAIL)
        }
        .andCleanup {
            // Cleanup test data
            orderRepository.deleteById(orderId)
            customerRepository.deleteById(customerId)
        }
}
```

---

## 5. Unit vs Integration Testing Trade-offs

### Unit Testing Approach

**Method:** Call listener method directly

```kotlin
@Test
fun `unit test - call listener directly`() {
    // Arrange
    val event = MediaAnalysisRequestedEvent(mediaId)
    val mockRepository = mock<MediaRepository>()
    val orchestrator = MediaAnalysisOrchestrator(mockRepository, ...)

    // Act
    orchestrator.onMediaAnalysisRequested(event)

    // Assert
    verify(mockRepository).save(any())
}
```

**Pros:**
- Fast execution (no Spring context)
- Simple setup with mocks
- Tests business logic in isolation
- No transaction/async complications

**Cons:**
- Doesn't test event wiring (`@ApplicationModuleListener`)
- Misses Spring transaction behavior
- Doesn't verify async execution
- Can miss integration issues

**When to use:** Testing business logic within the listener method.

### Integration Testing Approach

**Method:** Publish events and verify outcomes

```kotlin
@ApplicationModuleTest
@Test
fun `integration test - publish event`(scenario: Scenario) {
    // Arrange
    val mediaId = createTestMedia()

    // Act & Assert
    scenario
        .publish(MediaAnalysisRequestedEvent(mediaId))
        .andWaitForEventOfType(AnalysisJobCreatedEvent::class.java)
        .toArriveAndVerify { /* ... */ }
}
```

**Pros:**
- Tests complete event flow
- Verifies Spring wiring and annotations
- Catches transaction boundary issues
- Tests async behavior
- Validates module integration

**Cons:**
- Slower (requires Spring context)
- More complex setup
- Harder to isolate failures
- Database cleanup needed

**When to use:** Testing module integration and event-driven flows.

### Recommended Strategy

**Pyramid approach:**

1. **Many unit tests** (70%)
   - Fast, focused, isolated
   - Test business logic directly
   - Mock dependencies

2. **Some integration tests** (25%)
   - Test critical event flows
   - Use `Scenario` API
   - Verify module boundaries
   - Test orchestration patterns

3. **Few end-to-end tests** (5%)
   - Test complete business processes
   - Use `@SpringBootTest` with all modules
   - May use Testcontainers for external dependencies

**For orchestrators specifically:**
- Unit test: Business logic within listener methods
- Integration test: Event flows between modules
- Both approaches are valuable!

---

## 6. Event Publication Registry

### What It Solves

**Problem:** What if event listener fails? The publishing transaction has committed, but the listener didn't complete successfully.

**Solution:** Spring Modulith's Event Publication Registry automatically:
1. Tracks all event publications
2. Records which listeners should receive each event
3. Marks events as "complete" only after listener succeeds
4. Retries incomplete events on application startup

### How It Works

```sql
-- EVENT_PUBLICATION table (automatically created)
CREATE TABLE EVENT_PUBLICATION (
    ID UUID PRIMARY KEY,
    EVENT_TYPE VARCHAR(255),
    LISTENER_ID VARCHAR(255),
    PUBLICATION_DATE TIMESTAMP,
    SERIALIZED_EVENT TEXT,
    COMPLETION_DATE TIMESTAMP  -- NULL until listener succeeds
);
```

**Flow:**
1. Event published → Registry creates entry
2. Listener invoked → Entry remains incomplete
3. Listener succeeds → Entry marked complete (completion_date set)
4. Listener fails → Entry stays incomplete, retried later

### Testing with Event Registry

**Verify event was published:**
```kotlin
@Test
fun `should publish event to registry`() {
    transactionTemplate.execute {
        eventPublisher.publishEvent(MyEvent())
    }

    // Registry automatically tracks publication
    await().untilAsserted {
        val publications = eventPublicationRepository.findAll()
        assertThat(publications)
            .hasSize(1)
            .anyMatch { it.eventType == "MyEvent" }
    }
}
```

**Verify event was completed:**
```kotlin
@Test
fun `should mark event as completed after successful processing`(
    scenario: Scenario
) {
    scenario
        .publish(MyEvent())
        .andWaitForEventOfType(ProcessedEvent::class.java)
        .toArriveAndVerify {
            // Check registry shows completion
            val publications = eventPublicationRepository
                .findByEventType("MyEvent")
            assertThat(publications)
                .allMatch { it.completionDate != null }
        }
}
```

### Configuration

**Enable registry:**
```kotlin
@Configuration
class EventRegistryConfig {

    @Bean
    fun eventPublicationRegistry(
        eventPublicationRepository: EventPublicationRepository
    ): EventPublicationRegistry {
        return JdbcEventPublicationRegistry(eventPublicationRepository)
    }
}
```

**Or use starter (automatic):**
```xml
<dependency>
    <groupId>org.springframework.modulith</groupId>
    <artifactId>spring-modulith-starter-jpa</artifactId>
</dependency>
```

---

## 7. Practical Testing Patterns

### Pattern 1: Test Event Published

```kotlin
@ApplicationModuleTest
class EventPublisherTest {

    @Test
    fun `service should publish event when order completed`(
        scenario: Scenario
    ) {
        scenario
            .stimulate { orderService.complete(orderId) }
            .andWaitForEventOfType(OrderCompleted::class.java)
            .matching { it.orderId == orderId }
            .toArrive()
    }
}
```

### Pattern 2: Test Event Handler Side Effects

```kotlin
@ApplicationModuleTest
class EventHandlerTest(
    @Autowired private val shipmentRepository: ShipmentRepository
) {

    @Test
    fun `should create shipment when order completed`(
        scenario: Scenario
    ) {
        scenario
            .publish(OrderCompleted(orderId, customerId))
            .andWaitForStateChange {
                shipmentRepository.findByOrderId(orderId)
            }
            .andVerify { shipment ->
                assertThat(shipment).isNotNull
                assertThat(shipment.status).isEqualTo(PENDING)
            }
    }
}
```

### Pattern 3: Test Event Chain

```kotlin
@ApplicationModuleTest
class EventChainTest {

    @Test
    fun `should process complete order fulfillment chain`(
        scenario: Scenario
    ) {
        // Step 1: Order created
        scenario
            .publish(OrderCreated(orderId))
            .andWaitForEventOfType(InventoryChecked::class.java)
            .toArrive()

        // Step 2: Inventory reserved
        scenario
            .publish(InventoryReserved(orderId, productId))
            .andWaitForEventOfType(PaymentRequested::class.java)
            .toArrive()

        // Step 3: Payment completed
        scenario
            .publish(PaymentCompleted(orderId))
            .andWaitForEventOfType(ShipmentScheduled::class.java)
            .matching { it.orderId == orderId }
            .toArriveAndVerify { event ->
                val shipment = shipmentRepository.findById(event.shipmentId)
                assertThat(shipment.scheduledDate).isToday()
            }
    }
}
```

### Pattern 4: Test with Cleanup

```kotlin
@ApplicationModuleTest
class CleanupPatternTest {

    @Test
    fun `should process event and cleanup`(
        scenario: Scenario
    ) {
        val testData = createComplexTestData()

        scenario
            .publish(ProcessEvent(testData.id))
            .andCleanup {
                // Always runs, even if test fails
                testDataRepository.deleteById(testData.id)
                cacheService.evict(testData.id)
            }
            .andWaitForEventOfType(ProcessCompleted::class.java)
            .toArriveAndVerify { event ->
                assertThat(event.success).isTrue()
            }
    }
}
```

### Pattern 5: Test Error Scenarios

```kotlin
@ApplicationModuleTest
class ErrorScenarioTest {

    @Test
    fun `should publish error event when processing fails`(
        scenario: Scenario
    ) {
        // Create invalid data that will cause processing error
        val invalidMediaId = UUID.randomUUID()

        scenario
            .publish(MediaAnalysisRequestedEvent(invalidMediaId))
            .andWaitForEventOfType(MediaAnalysisFailedEvent::class.java)
            .matching {
                it.mediaId == invalidMediaId &&
                it.error.contains("Media not found")
            }
            .toArrive()
    }
}
```

---

## 8. Common Questions & Answers

### Q: Should I use @Transactional on my test class?

**A:** Generally **NO** for tests involving `@ApplicationModuleListener`.

```kotlin
// ❌ DON'T
@SpringBootTest
@Transactional  // Prevents listeners from firing
class MyTest

// ✅ DO
@ApplicationModuleTest  // No @Transactional
class MyTest
```

If you need transactional test data setup, use `TransactionTemplate` explicitly.

### Q: Why isn't my listener being called in tests?

**A:** Check these common causes:

1. **Missing transaction commit**: Events need publishing transaction to commit
2. **Missing @EnableAsync**: Required for async execution
3. **Wrong module scope**: Test bootstrap may not include listener's module
4. **Test has @Transactional**: Prevents post-commit listeners from firing

### Q: How do I test listeners that publish other events?

**A:** Use `Scenario` API with chained waits:

```kotlin
scenario
    .publish(FirstEvent())
    .andWaitForEventOfType(SecondEvent::class.java)
    .toArrive()

// Then verify third event
scenario
    .publish(SecondEvent())
    .andWaitForEventOfType(ThirdEvent::class.java)
    .toArrive()
```

### Q: What timeout should I use?

**A:** Depends on your use case:

- **Unit/fast integration**: 2-5 seconds
- **External API calls**: 10-30 seconds
- **Batch processing**: 1-2 minutes

```kotlin
scenario
    .publish(event)
    .andWaitAtMost(Duration.ofSeconds(5))  // Adjust as needed
    .andWaitForEventOfType(ResponseEvent::class.java)
```

### Q: How do I test with real database changes?

**A:** Don't use `@Transactional` on test. Clean up manually:

```kotlin
@ApplicationModuleTest
class DatabaseTest {

    @AfterEach
    fun cleanup() {
        repository.deleteAll()
    }

    @Test
    fun test(scenario: Scenario) {
        // Test makes real database changes
        // cleanup() will run after
    }
}
```

Or use cleanup callbacks:

```kotlin
scenario
    .publish(event)
    .andCleanup { repository.deleteAll() }
    .andWaitForEventOfType(Event::class.java)
```

---

## 9. Spring Boot 4.0 / Spring Modulith 2.0 Specific Notes

### New in Spring Modulith 2.0

1. **Enhanced Scenario API**: More fluent and type-safe
2. **Better error messages**: Clearer failure descriptions
3. **Improved timeout handling**: Configurable default timeouts
4. **AssertablePublishedEvents**: Available as injectable test bean (not just parameter)

### Spring Boot 4.0 Compatibility

- Full support for Spring Boot 4.0+ (requires Spring Framework 6.2+)
- Virtual threads support for `@Async` (if enabled)
- Improved observability with Micrometer spans

### Migration Notes from 1.x

**Spring Modulith 1.x:**
```kotlin
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
@Async
@Transactional(propagation = Propagation.REQUIRES_NEW)
fun onEvent(event: MyEvent) { }
```

**Spring Modulith 2.x:**
```kotlin
@ApplicationModuleListener  // Simpler!
fun onEvent(event: MyEvent) { }
```

The annotation behavior remains the same, but 2.0+ has better defaults and configuration options.

---

## 10. References & Further Reading

### Official Documentation
- [Spring Modulith Reference - Testing](https://docs.spring.io/spring-modulith/reference/testing.html)
- [Spring Modulith Reference - Events](https://docs.spring.io/spring-modulith/reference/events.html)
- [Spring Modulith API - Scenario](https://docs.spring.io/spring-modulith/docs/current/api/org/springframework/modulith/test/Scenario.html)

### Key GitHub Discussions
- [How to test event choreography? #96](https://github.com/spring-projects/spring-modulith/discussions/96) - Original Scenario API discussion
- [Testing events from other threads #1074](https://github.com/spring-projects/spring-modulith/issues/1074) - Async testing patterns

### Community Articles
- [Build a modular monolith with Spring Modulith - BellSoft](https://bell-sw.com/blog/how-to-build-a-modular-application-with-spring-modulith/) - Comprehensive tutorial
- [Event Externalization with Spring Modulith - Baeldung](https://www.baeldung.com/spring-modulith-event-externalization) - Event publication patterns
- [Comprehensive Guide to Spring Modulith - Szymon's Tech Blog](https://szymonsawicki.net/comprehensive-guide-to-spring-modulith/) - Architecture overview

### Related Technologies
- [Awaitility](https://github.com/awaitility/awaitility) - Used internally by Scenario API
- [AssertJ](https://assertj.github.io/doc/) - Fluent assertions
- [Testcontainers](https://testcontainers.com/) - For integration tests with real databases

---

## Summary: Quick Decision Guide

**Testing an orchestrator that receives events and updates entities:**

1. **Use Integration Tests** with `Scenario` API
   - Tests the complete flow including Spring wiring
   - Handles transaction boundaries correctly
   - Manages async timing automatically

2. **Also write Unit Tests** for business logic
   - Call listener methods directly
   - Mock repositories
   - Fast feedback on logic errors

3. **Key Pattern:**
```kotlin
@ApplicationModuleTest
class OrchestratorTest {
    @Test
    fun testOrchestrator(scenario: Scenario) {
        scenario
            .publish(TriggerEvent(id))
            .andWaitForEventOfType(ResultEvent::class.java)
            .matching { it.id == id }
            .toArriveAndVerify { event ->
                // Verify database state changed
                val entity = repository.findById(id)
                assertThat(entity.status).isEqualTo(PROCESSED)
            }
    }
}
```

**Most important takeaways:**
- Use `Scenario` API for event-driven integration tests
- Avoid `@Transactional` on test classes/methods
- Let Scenario handle transaction boundaries and async waiting
- Clean up test data with cleanup callbacks or `@AfterEach`
- Use realistic timeouts (2-5 seconds for fast operations)
