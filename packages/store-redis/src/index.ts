/** Keep in sync with this package's `version` in package.json. */
export const VERSION = '0.1.0';

export {
  type RedisLike,
  RedisResilienceStore,
  type RedisResilienceStoreOptions,
  redisResilienceStore,
} from './store.js';
