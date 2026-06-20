import RedisMock from 'ioredis-mock';
import type { RedisLike } from '../src/stores/redis.js';

let seq = 0;

/**
 * Fresh in-memory Redis (via `ioredis-mock`) for tests. ioredis-mock implements `defineCommand` and
 * executes the registered Lua against its in-memory store, so the store's atomic scripts run exactly
 * as they would against a real server — no Docker or live Redis required.
 *
 * ioredis-mock keys its shared backing datastore by connection `host`/`port`, so instances created
 * with the SAME `serverKey` share one datastore (modelling two pods on one Redis), while a fresh
 * unique key yields a fully isolated server. Omitting `serverKey` always allocates a new isolated
 * server — important because the default (host-less) mock is a single process-wide datastore.
 */
export function makeMockRedis(serverKey?: string): RedisLike {
  const host = serverKey ?? `iso-${++seq}`;
  return new RedisMock({ host }) as unknown as RedisLike;
}
