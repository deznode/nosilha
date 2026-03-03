# Strategy for Overriding Spring Boot Managed Dependency Versions

- **Status**: Accepted
- **Date**: 2026-03-02
- **Decision-makers**: Joaquim Costa

## Context and Problem Statement

During Dependabot vulnerability remediation (27 alerts, March 2026), we needed to override transitive dependency versions managed by the Spring Boot BOM. Standard Gradle approaches (`resolutionStrategy.force`, `constraints {}`) were silently overridden by the `io.spring.dependency-management` plugin, causing hours of debugging. How should we override Spring Boot managed dependency versions in Gradle, and how should we handle npm transitive vulnerabilities in the monorepo?

## Decision Drivers

- Need to patch CVEs in transitive dependencies quickly (security SLA)
- Must not break existing dependency compatibility
- The `io.spring.dependency-management` plugin has non-obvious override semantics
- npm vulnerabilities are primarily in dev/build tooling (Nx), not production bundles
- Solo-maintained project needs a repeatable, documented process

## Considered Options

1. `resolutionStrategy.force` in `configurations.all`
2. `ext['property-name']` to override BOM properties
3. Direct BOM import in `dependencyManagement.imports`
4. Drop `io.spring.dependency-management` plugin, use Gradle native BOM support

## Decision Outcome

**Chosen option**: "Direct BOM import" (Option 3) for Maven, combined with pnpm overrides for npm.

### Consequences

**Positive**:
- Works reliably with `io.spring.dependency-management` plugin
- No risk of property name shadowing across different BOM namespaces
- Explicit and auditable — the override is visible in `build.gradle.kts`
- pnpm overrides with version range selectors handle all npm major version ranges

**Negative**:
- Must remember that later BOM imports override earlier ones (order matters)
- Need to verify compatibility when overriding versions beyond what Spring Boot tested

## Pros and Cons of the Options

### Option 1: `resolutionStrategy.force`

```kotlin
configurations.all {
    resolutionStrategy {
        force("com.fasterxml.jackson.core:jackson-core:2.21.1")
    }
}
```

- Bad, because the `io.spring.dependency-management` plugin **silently overrides** forced versions
- Bad, because it appears to work (no error) but the resolved version is unchanged
- Good, because it's the standard Gradle approach (works without the Spring plugin)

### Option 2: `ext['property-name']` BOM property override

```kotlin
extra["jackson-bom.version"] = "2.21.1"
```

- Good, because it's the officially documented Spring Boot approach
- Bad, because property names can shadow internal BOM properties (e.g., `jackson.version` controls both `com.fasterxml.jackson` and `tools.jackson` namespaces in Spring Boot 4.x)
- Bad, because when managing dual Jackson stacks (2.x + 3.x), a single property override can break the other namespace

### Option 3: Direct BOM import (chosen)

```kotlin
dependencyManagement {
    imports {
        mavenBom("com.fasterxml.jackson:jackson-bom:2.21.1")
    }
}
```

- Good, because it targets a specific BOM without affecting other namespaces
- Good, because it works reliably with the `io.spring.dependency-management` plugin
- Good, because it's explicit — anyone reading `build.gradle.kts` can see the override
- Bad, because import order matters (later imports override earlier ones)

### Option 4: Drop the Spring plugin, use native Gradle BOM

```kotlin
dependencies {
    implementation(platform(SpringBootPlugin.BOM_COORDINATES))
    implementation(platform("com.fasterxml.jackson:jackson-bom:2.21.1"))
}
```

- Good, because `resolutionStrategy` works as expected (higher version wins)
- Good, because it follows Gradle's standard dependency resolution model
- Bad, because it requires removing `io.spring.dependency-management` (breaking change)
- Bad, because you lose property-based version customization from Spring Boot

## More Information

### Quick Reference: How to Override Dependencies

**Maven (Gradle with `io.spring.dependency-management`)**:

```kotlin
// In build.gradle.kts — import the patched BOM
dependencyManagement {
    imports {
        mavenBom("com.fasterxml.jackson:jackson-bom:2.21.1")
    }
}
```

**npm (pnpm overrides in root `package.json`)**:

```json
"pnpm": {
  "overrides": {
    "minimatch@>=10": "10.2.3",
    "lodash": ">=4.17.23"
  }
}
```

Use `"package@>=major": "patched-version"` for major-version-scoped overrides.

### Verification Commands

```bash
# Maven — verify resolved version
./gradlew dependencies --configuration runtimeClasspath | grep "jackson-core"

# npm — check vulnerabilities
pnpm audit

# Count open Dependabot alerts
gh api repos/OWNER/REPO/dependabot/alerts --jq '[.[] | select(.state=="open")] | length'
```

### References

- [Spring Boot issue #17808](https://github.com/spring-projects/spring-boot/issues/17808) — `jackson.version` property shadowing bug
- [Baeldung: Overriding Spring Boot Managed Dependency Versions](https://www.baeldung.com/spring-boot-override-dependency-versions)
- [Spring Boot Gradle Plugin: Managing Dependencies](https://docs.spring.io/spring-boot/gradle-plugin/managing-dependencies.html)
- [nexocode: Spring Dependencies in Gradle Can Be Tricky](https://nexocode.com/blog/posts/spring-dependencies-in-gradle/)
