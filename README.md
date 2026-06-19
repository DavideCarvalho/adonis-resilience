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

- **In-process** (default): `InMemoryResilienceStore` — single process.
- **SQL**: `SqlResilienceStore` — agnostic over a `SqlDriver`; back it with Lucid,
  any Postgres/SQLite driver, etc. `CIRCUITS_DDL` ships the schema.

> Dedicated store-adapter packages (`-store-lucid`, `-store-redis`, …) are
> planned follow-ups; the exported `SqlResilienceStore` + a thin driver already
> cover distributed persistence today.

## License

MIT © Davi Carvalho
