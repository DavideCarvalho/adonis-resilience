import { afterEach, describe, expect, it } from 'vitest';
import { InMemoryResilienceStore } from './breaker/in-memory.store.js';
import { retry } from './policies/retry.js';
import { timeout } from './policies/timeout.js';
import { ResilienceService } from './resilience_service.js';

describe('ResilienceService', () => {
  afterEach(() => {
    // nothing global to reset
  });

  it('runs an operation through an ad-hoc policy', async () => {
    const svc = new ResilienceService({ emit: false });
    const result = await svc.execute(timeout(1000), async () => 42);
    expect(result).toBe(42);
  });

  it('resolves and runs a named policy', async () => {
    let attempts = 0;
    const svc = new ResilienceService({
      emit: false,
      policies: { flaky: () => retry({ attempts: 3 }) },
    });
    const result = await svc.execute('flaky', async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('transient');
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('throws for an unknown named policy', () => {
    const svc = new ResilienceService({ emit: false });
    // resolve() runs synchronously before the operation promise is created.
    expect(() => svc.execute('nope', async () => 1)).toThrow(/Unknown resilience policy/);
  });

  it('exposes per-circuit snapshot + reset over the store', async () => {
    const store = new InMemoryResilienceStore();
    const svc = new ResilienceService({ emit: false, store });
    const snap = await svc.circuit('db').snapshot();
    expect(snap.status).toBe('closed');
    await expect(svc.circuit('db').reset()).resolves.toBeUndefined();
  });
});
