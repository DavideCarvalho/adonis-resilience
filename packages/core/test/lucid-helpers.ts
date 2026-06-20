import { Emitter } from '@adonisjs/core/events';
import { AppFactory } from '@adonisjs/core/factories/app';
import { LoggerFactory } from '@adonisjs/core/factories/logger';
import { Database } from '@adonisjs/lucid/database';
import type { LucidDatabase } from '../src/stores/lucid.js';

/**
 * Build a standalone Lucid `Database` pointed at an in-memory sqlite database — the "using Lucid
 * outside an app" pattern (a config object plus an `Emitter` and `Logger`). Each call yields a fresh
 * `:memory:` database, so tests are fully isolated.
 */
export function makeMemoryDatabase(): Database {
  const app = new AppFactory().create(new URL('./', import.meta.url), () => {}) as any;
  const logger = new LoggerFactory().create();
  const emitter = new Emitter(app);

  return new Database(
    {
      connection: 'primary',
      connections: {
        primary: {
          client: 'better-sqlite3',
          connection: { filename: ':memory:' },
          useNullAsDefault: true,
        },
      },
    },
    logger,
    emitter,
  );
}

/** Narrow a Lucid `Database` to the structural surface this store consumes. */
export function asLucidDatabase(db: Database): LucidDatabase {
  return db as unknown as LucidDatabase;
}
