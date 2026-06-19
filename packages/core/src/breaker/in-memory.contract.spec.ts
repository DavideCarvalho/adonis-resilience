import { InMemoryResilienceStore } from './in-memory.store';
import { runResilienceStoreContract } from './store-contract';

runResilienceStoreContract(
  'InMemoryResilienceStore',
  (clock) => new InMemoryResilienceStore(clock),
);
