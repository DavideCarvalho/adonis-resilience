/** Keep in sync with this package's `version` in package.json. */
export const VERSION = '0.1.0';

export {
  CIRCUITS_DDL,
  ensureResilienceSchema,
  type LucidDatabase,
  type LucidQueryClient,
  LucidResilienceStore,
  type LucidResilienceStoreOptions,
  lucidResilienceStore,
} from './store.js';
