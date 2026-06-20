import { redisResilienceStore } from '../src/index.js';
import { runResilienceStoreContract } from '../src/testing.js';
import { makeMockRedis } from './redis-helpers.js';

// Fresh isolated ioredis-mock server per makeStore call → each contract case is isolated even though
// the contract reuses key 'k'. The Lua scripts run atomically inside the mock exactly as on real Redis.
runResilienceStoreContract('RedisResilienceStore', (clock) =>
  redisResilienceStore(makeMockRedis(), { clock }),
);
