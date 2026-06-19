---
'@agora/resilience-store-lucid': minor
---

Add `@agora/resilience-store-lucid`: a Lucid-backed circuit-breaker `ResilienceStore` that feeds the agnostic `SqlResilienceStore` from `@agora/resilience` a thin Lucid `SqlDriver`. Ships a `lucidResilienceStore(db, opts?)` factory, lazy/idempotent schema creation, and an `ensureResilienceSchema` helper.
