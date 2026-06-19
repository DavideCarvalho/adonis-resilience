# @agora/resilience-store-lucid

A production circuit-breaker [`ResilienceStore`](https://github.com/DavideCarvalho/adonis-resilience)
for [`@agora/resilience`](../core), backed by AdonisJS **Lucid**.

It feeds the agnostic `SqlResilienceStore` from `@agora/resilience` a thin Lucid-based `SqlDriver`,
so every circuit-breaker semantic lives in core and this package only bridges to Lucid. Works on any
dialect Lucid supports; the breaker SQL relies on `FOR UPDATE` row locks for atomicity on databases
that support them (Postgres, MySQL).

## Install

```sh
npm i @agora/resilience-store-lucid
# peers: @adonisjs/core, @adonisjs/lucid
```

## Usage

Wire the factory into `config/resilience.ts`:

```ts
import db from '@adonisjs/lucid/services/db'
import { defineConfig } from '@agora/resilience'
import { lucidResilienceStore } from '@agora/resilience-store-lucid'

export default defineConfig({
  store: lucidResilienceStore(db),
})
```

The circuit table is created lazily on first use (idempotent `CREATE TABLE IF NOT EXISTS`). To manage
the schema yourself with a migration, pass `autoCreateSchema: false` and run the DDL via a migration.

## Schema

Use the exported `CIRCUITS_DDL` in an Adonis migration, or call `ensureResilienceSchema(db)` once at
boot:

```ts
import db from '@adonisjs/lucid/services/db'
import { ensureResilienceSchema } from '@agora/resilience-store-lucid'

await ensureResilienceSchema(db)
```

The table:

```sql
CREATE TABLE IF NOT EXISTS resilience_circuits (
  key        TEXT PRIMARY KEY,
  status     TEXT    NOT NULL DEFAULT 'closed',
  failures   INTEGER NOT NULL DEFAULT 0,
  open_until BIGINT  NOT NULL DEFAULT 0,
  probes     INTEGER NOT NULL DEFAULT 0
);
```

## API

- `lucidResilienceStore(db, opts?)` — factory returning a `ResilienceStore`.
- `LucidResilienceStore` — the class form.
- `ensureResilienceSchema(db)` — run the idempotent DDL.
- `CIRCUITS_DDL` — the raw DDL string (re-exported from core) for migrations.

`opts` extends core's `SqlResilienceStoreOptions` (`clock`) with `autoCreateSchema` (default `true`).
