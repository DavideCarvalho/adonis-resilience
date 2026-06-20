import { lucidResilienceStore } from '../src/index.js';
import { runResilienceStoreContract } from '../src/testing.js';
import { asLucidDatabase, makeMemoryDatabase } from './lucid-helpers.js';

// Fresh in-memory sqlite Database per makeStore call → each contract case is isolated.
// The store lazily creates its table on first use, so no explicit DDL step is needed here.
runResilienceStoreContract('LucidResilienceStore', (clock) =>
  lucidResilienceStore(asLucidDatabase(makeMemoryDatabase()), { clock }),
);
