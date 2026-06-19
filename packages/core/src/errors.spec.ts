import { describe, expect, it } from 'vitest';
import { BrokenCircuitError, TimeoutError } from './errors';

describe('errors', () => {
  it('TimeoutError carries ms and is an Error', () => {
    const e = new TimeoutError(500);
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('TimeoutError');
    expect(e.ms).toBe(500);
  });
  it('BrokenCircuitError carries the key', () => {
    const e = new BrokenCircuitError('sms:twilio');
    expect(e.name).toBe('BrokenCircuitError');
    expect(e.key).toBe('sms:twilio');
  });
});
