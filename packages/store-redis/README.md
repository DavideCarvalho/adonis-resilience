# @agora/resilience-store-redis

A distributed circuit-breaker [`ResilienceStore`](https://github.com/DavideCarvalho/adonis-resilience)
for [`@agora/resilience`](../core), backed by [`@adonisjs/redis`](https://docs.adonisjs.com/guides/digging-deeper/redis)
(ioredis).

Circuit state — failure counts, open/half-open status, `openUntil` — lives in a single Redis hash
per circuit key and is mutated entirely inside server-side **Lua scripts**. That makes every
transition atomic on the Redis server, so the breaker is shared across processes and pods with no
lost updates and exactly one half-open probe granted under concurrency. The Lua branching mirrors
core's pure `computeAdmit` / `computeRecord`, so a Redis-backed circuit behaves identically to the
in-memory and SQL stores and passes the same `runResilienceStoreContract`.

## Install

```sh
npm i @agora/resilience-store-redis
# peers: @adonisjs/core, @adonisjs/redis, ioredis
```

## Usage

Wire the factory into `config/resilience.ts`:

```ts
import redis from '@adonisjs/redis/services/main'
import { defineConfig } from '@agora/resilience'
import { redisResilienceStore } from '@agora/resilience-store-redis'

export default defineConfig({
  store: redisResilienceStore(redis.connection()),
})
```

It accepts an `@adonisjs/redis` connection or a raw `ioredis` client — both satisfy the structural
`RedisLike` surface the store depends on.

## Storage layout

Each circuit is a Redis hash keyed by `<prefix><circuit-key>` (default prefix
`agora:resilience:circuit:`), with fields `status` / `failures` / `openUntil` / `probes`.

## Options

- `clock?` — clock used for `now()` / cooldown math (defaults to the system clock).
- `keyPrefix?` — namespace prepended to every circuit key (default `agora:resilience:circuit:`).
- `ttlMs?` — optional sliding TTL (ms) applied on every write, so idle circuits eventually expire
  and reset to the closed default. Omit (or `0`) to keep state forever.

```ts
redisResilienceStore(redis.connection(), {
  keyPrefix: 'myapp:cb:',
  ttlMs: 24 * 60 * 60 * 1000, // expire circuits idle for 24h
})
```

## API

- `redisResilienceStore(redis, opts?)` — factory returning a `ResilienceStore`.
- `RedisResilienceStore` — the class form.
- `RedisLike` — the structural ioredis surface the store consumes.
