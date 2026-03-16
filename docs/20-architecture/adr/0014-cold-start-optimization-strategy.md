# Cold Start Optimization Strategy for Cloud Run

- **Status**: Accepted
- **Date**: 2026-03-15
- **Decision-makers**: Joaquim Costa

## Context and Problem Statement

The Spring Boot 4 backend on GCP Cloud Run experiences 10–20 second cold starts due to JVM bootstrap time combined with `cpu_idle = true` (see [ADR-0006](0006-free-tier-cost-optimization.md)). Scale-to-zero is essential for staying within free tier, but cold starts degrade the first-request experience. How should we reduce cold start latency without increasing infrastructure cost?

## Decision Drivers

- **Cost**: Must remain within GCP free tier ($0–5/month) — no always-on instances
- **Compatibility**: Must work with Spring Boot 4.0.3, Java 25, and Paketo buildpacks
- **Safety**: Must not break Spring Modulith event listeners or async processing
- **Reversibility**: Prefer toggleable optimizations over architectural rewrites
- **Maintenance**: Solo-maintained project — minimize operational complexity

## Considered Options

1. AppCDS + JVM optimizations (lazy init, virtual threads, startup CPU boost)
2. GraalVM native image compilation
3. Migrate from Cloud Run to Fly.io Machines

## Decision Outcome

**Chosen option**: "AppCDS + JVM optimizations" (Option 1), because it provides significant cold start reduction (~60–80%) with minimal effort, zero cost, full compatibility with the existing stack, and is incrementally toggleable. AppCDS itself is deferred due to a Paketo buildpack bug on Java 25 but the remaining optimizations are deployed immediately.

### Consequences

**Positive**:
- Estimated cold start reduction from 10–20s to 2–4s (without AppCDS; ~1–2s with AppCDS when available)
- Zero infrastructure cost increase
- All optimizations are individually toggleable via configuration
- Virtual threads (JEP 491, Java 25) eliminate synchronized-block pinning — safe for HikariCP, Hibernate 7, Spring Security
- Lazy initialization defers non-critical beans, reducing startup class loading
- Cloud Run startup CPU boost allocates extra CPU during startup at no cost

**Negative**:
- AppCDS deferred indefinitely until Paketo fixes Java 25 support (tracked: paketo-buildpacks/spring-boot#581)
- Lazy initialization requires `@Lazy(false)` on pure-sink event listener beans to prevent silent event loss
- Virtual threads change concurrency semantics (though JEP 491 mitigates the main risk)

## Pros and Cons of the Options

### Option 1: AppCDS + JVM Optimizations (chosen)

Layered approach combining multiple JVM and Cloud Run features:

| Optimization | Expected Impact | Status |
|-------------|----------------|--------|
| Lazy bean initialization | ~20–30% startup reduction | Deployed |
| Virtual threads (JEP 491) | Reduced thread overhead during I/O | Deployed |
| Cloud Run startup CPU boost | Extra CPU during startup probe window | Deployed |
| AppCDS (class data sharing) | ~30–40% additional reduction | Deferred (Paketo #581) |

- Good, because each optimization is independently toggleable
- Good, because zero cost — all features are built into JVM and Cloud Run
- Good, because no architectural changes required
- Good, because research-validated against Spring Boot 4.0.3 and Java 25
- Bad, because AppCDS (the largest single optimization) is blocked by Paketo buildpack bug
- Bad, because lazy init requires auditing all `@ApplicationModuleListener` beans for eager loading

### Option 2: GraalVM Native Image

Ahead-of-time compile the Spring Boot application into a native binary (~50ms cold starts).

- Good, because near-instant cold starts (~50–200ms)
- Good, because lower memory footprint
- Bad, because Spring Boot 4 + Spring Modulith native image support is immature
- Bad, because reflection-heavy libraries (Hibernate, Jackson 3.x) require extensive configuration
- Bad, because build times increase from ~1 min to ~10 min
- Bad, because debugging production issues is significantly harder
- Bad, because high initial effort (~2–4 weeks) with ongoing maintenance burden

### Option 3: Migrate to Fly.io Machines

Replace GCP Cloud Run with Fly.io Machines which support suspend-to-disk (instant resume).

- Good, because ~200ms resume from suspended state
- Good, because simpler developer experience
- Bad, because requires migrating all infrastructure (Terraform, secrets, CI/CD, monitoring)
- Bad, because abandons existing GCP free tier investment (see [ADR-0006](0006-free-tier-cost-optimization.md))
- Bad, because Fly.io free tier is less generous for this workload
- Bad, because high migration effort (~1–2 weeks) with new operational knowledge required

## Implementation Details

### Deployed Optimizations

**1. Lazy Bean Initialization** (`application.yml`):
```yaml
spring:
  main:
    lazy-initialization: true
```

**2. Virtual Threads** (`application.yml`):
```yaml
spring:
  threads:
    virtual:
      enabled: true
```

**3. Eager Loading for Event Listeners** (`@Lazy(false)`):

Two pure-sink `@ApplicationModuleListener` beans that are never injected by controllers must be marked eager to prevent silent event loss under lazy initialization:

- `ImageAnalysisOrchestrator` — listens for `MediaAnalysisRequestedEvent`
- `MdxFileWriter` — listens for `MdxCommittedEvent`

**4. Cloud Run Startup CPU Boost** (`cloudrun.tf`):
```hcl
containers {
  resources {
    startup_cpu_boost = true
  }
}
```

### Deferred: AppCDS

AppCDS (Application Class Data Sharing) pre-computes class loading metadata at Docker build time. Spring Boot's `bootBuildImage` task supports this via the Paketo buildpack with `BP_JVM_CDS_ENABLED=true`.

**Current blocker**: Paketo buildpack issue [paketo-buildpacks/spring-boot#581](https://github.com/paketo-buildpacks/spring-boot/issues/581) — the executor mishandles JVM's non-zero exit code from the CDS training run on Java 25, despite the AOT cache being created successfully.

**Re-enable when fixed** (`build.gradle.kts`):
```kotlin
tasks.getByName<BootBuildImage>("bootBuildImage") {
    environment.set(mapOf("BP_JVM_CDS_ENABLED" to "true"))
}
```

## More Information

- [ADR-0006: Free Tier Cost Optimization](0006-free-tier-cost-optimization.md) — explains `cpu_idle = true` and scale-to-zero strategy
- [JEP 491: Synchronize Virtual Threads without Pinning](https://openjdk.org/jeps/491) — integrated in Java 24/25
- [Paketo Spring Boot Buildpack #581](https://github.com/paketo-buildpacks/spring-boot/issues/581) — AppCDS Java 25 compatibility tracker
- [Spring Boot 4 Virtual Threads Support](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html) — official documentation
