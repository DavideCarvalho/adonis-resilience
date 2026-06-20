---
'@agora/resilience': minor
---

Collapse the Lucid and Redis circuit stores into the core package as config-driven drivers. `config/resilience.ts` now picks a store with `defineConfig({ default, stores })` built from the `stores` factory namespace (`stores.memory()`, `stores.lucid({ connection })`, `stores.redis({ connection })`). `@adonisjs/lucid`, `@adonisjs/redis` and `ioredis` become optional peer dependencies, lazily imported only when their store is selected. The standalone `@agora/resilience-store-lucid` / `@agora/resilience-store-redis` packages are removed; `lucidResilienceStore` / `redisResilienceStore` / `ensureResilienceSchema` are now exported from `@agora/resilience`. An explicit `store` in config still works.
