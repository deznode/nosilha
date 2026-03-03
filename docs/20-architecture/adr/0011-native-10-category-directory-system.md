# ADR 0011: Native 10-Category Directory System

- **Status**: Accepted
- **Date**: 2026-02-23
- **Decision-makers**: @jcosta

## Context and Problem Statement

The backend supports five directory categories — Restaurant, Hotel, Beach, Heritage, and Nature — implemented as JPA Single Table Inheritance subclasses under `DirectoryEntry`. The original BravaMap SPA had ten categories: the five above plus Town, Viewpoint, Trail, Church, and Port.

During the BravaMap migration (spec 023, V28 migration), the five additional categories were mapped to existing backend types and the original category was preserved as a `map:` prefixed tag in the comma-separated `tags` column (e.g., `"map:Town,capital,colonial"`). The frontend adapter (`locations-adapter.ts`) reads this tag to reconstruct the correct BravaMap category at query time.

This is a leaky abstraction: the `tags` column was designed to carry freeform discovery keywords, not category discriminators. The adapter's `resolveCategory()` function mixes category resolution logic into what should be a pure data-shape transformation. Any new consumer of the API that wants to display a "Town" or "Viewpoint" as distinct from "Nature" must independently discover and implement the `map:` tag convention.

How should the backend be extended to natively represent all ten categories so that the `map:` tag workaround can be eliminated?

## Decision Drivers

- **Semantic correctness**: a Church should be queryable as a Church at the API level without tag inspection
- **Convention adherence**: new categories should be added the same way existing ones were; no new patterns
- **Non-breaking migration**: existing data must remain queryable without service interruption; the migration updates rows in place
- **Minimal footprint**: the project is solo-maintained; the solution should add exactly what is needed
- **Frontend simplicity**: after the backend change, `locations-adapter.ts` should be a straightforward field mapping with no category-resolution logic

## Considered Options

1. Add five new STI entity subclasses (Town, Viewpoint, Trail, Church, Port)
2. Replace STI with an enum-based `CategoryType` column and a single `DirectoryEntry` entity
3. Keep five backend categories and add a nullable `subcategory` column

## Decision Outcome

**Chosen option**: Option 1 — add five new Kotlin entity classes under `places/domain/`, each using `@Entity @DiscriminatorValue("X")`, following the identical pattern used for the existing five categories.

This is the correct choice because the existing STI pattern is well-established: Restaurant, Hotel, Beach, Heritage, and Nature are all one-liner entity files. The `category VARCHAR(255)` column has no CHECK constraint, so no DDL change is needed. The `@JsonSubTypes` annotation in `DirectoryEntryDto` and the `when(this)` exhaustive check in `Mapper.kt::toDto()` already define the extension points. Adding Town, Viewpoint, Trail, Church, and Port requires touching exactly those two files plus a Flyway migration — no new patterns, no breaking API changes.

The migration (V29) will: (1) update the `category` discriminator column for rows that currently carry `Nature` or `Heritage` with a `map:` tag, (2) strip the `map:` prefix from the affected `tags` values, and (3) leave the five categories that already have correct discriminator values untouched.

After the backend change, the frontend adapter is simplified: `resolveCategory()` is deleted, and `BACKEND_TO_MAP_FALLBACK` is replaced with a direct mapping where the `category` value returned by the API already equals the `CategoryType` expected by BravaMap.

### Consequences

**Positive**:
- The API returns `"category": "Town"` for a town; no client needs special tag-inspection logic
- `Mapper.kt::toDto()` and `getCategoryValue()` become exhaustive over ten types; the `else -> throw` branch is even less likely to fire
- `locations-adapter.ts::resolveCategory()` is deleted; the unit tests no longer need `"resolves category from map: tag"` cases
- New categories (should any be needed in future) follow the same one-liner pattern
- Frontend `CategoryType` union in `categories.ts` already lists all ten values; no frontend category definition changes required

**Negative**:
- Five more Kotlin files (one-liners), which is noisy; however this matches the project's existing noise level (Heritage, Beach, Nature are also one-liners)
- `@JsonSubTypes` in `DirectoryEntryDto.kt` grows to ten entries; mechanical but must not be forgotten
- `Mapper.kt::toDto()` `when(this)` block grows to ten branches; the five new branches are copy-paste identical to the Heritage/Nature pattern
- V29 migration must be carefully ordered: update discriminator values before stripping tags, and be idempotent

## Pros and Cons of the Options

### Option 1: Add five new STI entity subclasses

Five new classes (Town, Viewpoint, Trail, Church, Port) declared identically to Heritage and Nature. No new columns, no schema structure changes — only new discriminator values. V29 migration updates existing rows from `Nature`/`Heritage` to the correct new value where a `map:` tag signals the real category.

- Good, because identical to the existing pattern; zero learning curve
- Good, because non-breaking: the five original categories continue to work unchanged
- Good, because `DirectoryEntryDto` polymorphism (`@JsonSubTypes`, `@JsonTypeName`) already handles this
- Good, because enables `resolveCategory()` deletion, removing the only non-trivial logic from the adapter
- Bad, because five more files that are empty subclasses; intent expressed only in the discriminator annotation

### Option 2: Replace STI with enum-based category column

Collapse all entity subclasses into a single `DirectoryEntry` class with a `CategoryType` enum column. The discriminator column becomes an enum.

- Good, because a flat model is conceptually simpler
- Good, because adding a new category is a one-line enum addition
- Bad, because this is a breaking change to the API: `@JsonSubTypes` polymorphism would need to be replaced
- Bad, because the refactor scope (entity, mapper, all DTOs, all tests, all frontend types) is disproportionate to the problem
- Bad, because type-specific query capabilities would require explicit category filters instead of JPA type polymorphism

### Option 3: Keep five backend categories, add nullable subcategory column

A new nullable `subcategory VARCHAR(50)` column carries the five new values for rows that need them.

- Good, because no new entity files; minimal schema change
- Bad, because it does not solve the problem: the API still returns `category: "Nature"` for a Town
- Bad, because `resolveCategory()` in the adapter would be rewritten but not deleted; the leaky abstraction migrates to a different shape
- Bad, because `DirectoryEntryDto` would have an asymmetric `subcategory` field: null for five categories, populated for five others

## More Information

### Category mapping for V29 migration

| SPA Category | Current Backend Category | `map:` Tag | New Backend Category |
|---|---|---|---|
| Town | Nature | `map:Town` | Town |
| Viewpoint | Nature | `map:Viewpoint` | Viewpoint |
| Trail | Nature | `map:Trail` | Trail |
| Port | Nature | `map:Port` | Port |
| Church | Heritage | `map:Church` | Church |
| Restaurant | Restaurant | — | Restaurant (unchanged) |
| Hotel | Hotel | — | Hotel (unchanged) |
| Beach | Beach | — | Beach (unchanged) |
| Heritage | Heritage | — | Heritage (unchanged) |
| Nature | Nature | — | Nature (unchanged) |

### V29 migration sketch

```sql
-- V29__add_native_map_categories.sql

-- Update discriminator values for rows with map: tags
UPDATE directory_entries SET category = 'Town'
WHERE category = 'Nature' AND tags LIKE '%map:Town%';

UPDATE directory_entries SET category = 'Viewpoint'
WHERE category = 'Nature' AND tags LIKE '%map:Viewpoint%';

UPDATE directory_entries SET category = 'Trail'
WHERE category = 'Nature' AND tags LIKE '%map:Trail%';

UPDATE directory_entries SET category = 'Port'
WHERE category = 'Nature' AND tags LIKE '%map:Port%';

UPDATE directory_entries SET category = 'Church'
WHERE category = 'Heritage' AND tags LIKE '%map:Church%';

-- Strip map: tags (now redundant)
UPDATE directory_entries
SET tags = TRIM(BOTH ',' FROM
    regexp_replace(tags, '(,?map:[A-Za-z]+,?)', ',', 'g')
  )
WHERE tags ~ 'map:[A-Za-z]+';
```

### New entity file pattern

Each file follows the Heritage/Nature pattern exactly:

```kotlin
// places/domain/Viewpoint.kt
@Entity
@DiscriminatorValue("Viewpoint")
class Viewpoint : DirectoryEntry()
```

Identical for Town, Trail, Church, and Port.

### Files to create or modify

| File | Change |
|------|--------|
| `apps/api/.../places/domain/Town.kt` | New entity subclass |
| `apps/api/.../places/domain/Viewpoint.kt` | New entity subclass |
| `apps/api/.../places/domain/Trail.kt` | New entity subclass |
| `apps/api/.../places/domain/Church.kt` | New entity subclass |
| `apps/api/.../places/domain/Port.kt` | New entity subclass |
| `apps/api/.../places/domain/Mapper.kt` | Add 5 `when` branches in `toDto()` and `getCategoryValue()` |
| `apps/api/.../shared/api/DirectoryEntryDto.kt` | Add 5 `@JsonSubTypes.Type` entries + 5 new DTO classes |
| `apps/api/.../db/migration/V29__add_native_map_categories.sql` | Update discriminator values, strip map: tags |
| `apps/web/src/features/map/data/locations-adapter.ts` | Delete `resolveCategory()` and `BACKEND_TO_MAP_FALLBACK`; simplify `transformEntries` |
| `apps/web/src/types/directory.ts` | Add 5 new category literals to union type |
| `apps/web/src/lib/directory-utils.ts` | Add 5 new entries to `CATEGORIES` object |
| `apps/web/src/lib/api-contracts.ts` | Add 5 new category literals to submission types |
| `apps/web/tests/unit/features/map/locations-adapter.test.ts` | Remove map: tag test cases; add native 10-category pass-through test |

### Note on `namePortuguese` placeholder

The `Location` type includes `namePortuguese: string`. The adapter sets `namePortuguese: entry.name` as a placeholder because the backend has no separate Portuguese name field. Adding a `namePt` column is a distinct content data model question and is not addressed by this ADR.

### Related artifacts

- Spec: `plan/arkhe/specs/023-brava-map-migration/`
- Prerequisite for: [ADR-0010](0010-bravamap-component-decomposition.md) adapter simplification
- V28 migration: `apps/api/src/main/resources/db/migration/V28__seed_brava_map_pois.sql` (the seed data this corrects)
