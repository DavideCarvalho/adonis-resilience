import { runResilienceStoreContract } from '@agora/resilience/testing';
import { lucidResilienceStore } from '../src/index.js';
import { asLucidDatabase, makeMemoryDatabase } from './helpers.js';

// Fresh in-memory sqlite Database per makeStore call → each contract case is isolated.
// The store lazily creates its table on first use, so no explicit DDL step is needed here.
runResilienceStoreContract('LucidResilienceStore', (clock) =>
  lucidResilienceStore(asLucidDatabase(makeMemoryDatabase()), { clock }),
);
