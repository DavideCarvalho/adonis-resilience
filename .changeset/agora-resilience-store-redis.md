---
'@agora/resilience-store-redis': minor
---

Add `@agora/resilience-store-redis`: a distributed circuit-breaker `ResilienceStore` backed by `@adonisjs/redis` (ioredis), so circuit state (failure counts, open-until) is shared across processes and pods. Per-circuit state lives in a Redis hash mutated entirely inside atomic Lua scripts that mirror core's `computeAdmit`/`computeRecord`, granting exactly one half-open probe under concurrency with no lost updates. Ships a `redisResilienceStore(redis, opts?)` factory with configurable key namespace and optional sliding TTL for idle circuits.
