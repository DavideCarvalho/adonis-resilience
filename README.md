# `@agora/resilience`

> Resilience policies for **AdonisJS** — timeout, retry, circuit breaker, and
> ordered failover — with pluggable circuit stores. Part of the
> [Agora](https://github.com/DavideCarvalho) ecosystem.

## Install

```sh
npm i @agora/resilience
node ace configure @agora/resilience
```

## Use

Compose policies as plain functions, or register named ones in `config/resilience.ts`:

```ts
import { wrap, timeout, retry, exponential, circuitBreaker } from '@agora/resilience'

const policy = wrap(
  timeout(2000),
  retry({ attempts: 3, backoff: exponential(100) }),
  circuitBreaker({ key: 'payments', threshold: 5, cooldownMs: 30_000 }),
)
const result = await policy.execute(() => chargeCard())
```

Or through the container-resolved service:

```ts
import { ResilienceService } from '@agora/resilience'

const resilience = await app.container.make(ResilienceService)
await resilience.execute('db', () => query())              // named policy
await resilience.failover({ targets, attempt })            // ordered failover
await resilience.circuit('payments').snapshot()            // inspect / reset
```

Events publish on `agora:resilience:*` via `@agora/diagnostics` when installed
(read structurally through a global slot — no hard dependency), so a Telescope
watcher records every circuit open / failover / retry with `traceId` correlation.
Per-tenant circuit keys read the tenant from `@agora/context` when present.

## Circuit stores

The circuit store is selected in `config/resilience.ts` with the `stores` factory.
All three ship in this package; the Lucid/Redis drivers lazily import their peer
dependency only when selected, so installing one stays optional.

```ts
import { defineConfig, stores } from '@agora/resilience'

export default defineConfig({
  default: 'memory',
  stores: {
    memory: stores.memory(),                      // in-process (default)
    lucid: stores.lucid({ connection: 'pg' }),    // SQL via @adonisjs/lucid
    redis: stores.redis({ connection: 'main' }),  // @adonisjs/redis + ioredis
  },
})
```

- **memory** (default): in-process, single process — no peer dependency.
- **lucid**: SQL via `@adonisjs/lucid` (Postgres / MySQL / SQLite); table
  auto-created, or run `CIRCUITS_DDL` from a migration.
- **redis**: distributed via `@adonisjs/redis` / `ioredis`; atomic Lua, no schema.

Bring your own engine by implementing `SqlDriver` over the exported
`SqlResilienceStore`, or the four `ResilienceStore` methods directly.

## License

MIT © Davi Carvalho
