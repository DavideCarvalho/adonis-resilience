import { afterEach, describe, expect, it } from 'vitest';
import type { ResilienceEvent } from '../events.js';
import { diagnosticsSink } from './diagnostics.js';

const EMIT_SLOT = Symbol.for('@agora/diagnostics:emit');

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[EMIT_SLOT];
});

describe('diagnosticsSink', () => {
  it('republishes resilience events through the global emit slot', () => {
    const calls: any[] = [];
    (globalThis as Record<symbol, unknown>)[EMIT_SLOT] = (
      lib: string,
      event: string,
      payload: unknown,
    ) => calls.push({ lib, event, payload });

    const event = { type: 'circuit-opened', key: 'db', at: 0 } as unknown as ResilienceEvent;
    diagnosticsSink()(event);

    expect(calls).toHaveLength(1);
    expect(calls[0].lib).toBe('resilience');
    expect(calls[0].event).toBe('circuit-opened');
    expect(calls[0].payload.key).toBe('db');
  });

  it('no-ops when @agora/diagnostics is not installed', () => {
    const event = { type: 'circuit-opened', key: 'db', at: 0 } as unknown as ResilienceEvent;
    expect(() => diagnosticsSink()(event)).not.toThrow();
  });
});
