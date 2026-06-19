import { runResilienceStoreContract } from '@agora/resilience/testing';
import { redisResilienceStore } from '../src/index.js';
import { makeMockRedis } from './helpers.js';

// Fresh isolated ioredis-mock server per makeStore call → each contract case is isolated even though
// the contract reuses key 'k'. The Lua scripts run atomically inside the mock exactly as on real Redis.
runResilienceStoreContract('RedisResilienceStore', (clock) =>
  redisResilienceStore(makeMockRedis(), { clock }),
);
