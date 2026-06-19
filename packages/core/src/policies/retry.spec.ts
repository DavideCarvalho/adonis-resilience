import { describe, expect, it, vi } from 'vitest';
import { FakeClock } from '../clock';
import { exponential, retry } from './retry';

describe('retry', () => {
  it('returns the first success without retrying', async () => {
    const op = vi.fn(async () => 'ok');
    await expect(retry({ attempts: 3 }).execute(op)).resolves.toBe('ok');
    expect(op).toHaveBeenCalledOnce();
  });

  it('retries up to `attempts` then rethrows the last error', async () => {
    const op = vi.fn(async () => {
      throw new Error('boom');
    });
    const clock = new FakeClock();
    const p = retry({ attempts: 3, backoff: () => 10, clock });
    const result = p.execute(op);
    // drive the two backoff delays
    await Promise.resolve();
    clock.advance(10);
    await Promise.resolve();
    await Promise.resolve();
    clock.advance(10);
    await Promise.resolve();
    await Promise.resolve();
    await expect(result).rejects.toThrow('boom');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('exposes the 0-based attempt number to the op', async () => {
    const seen: number[] = [];
    const clock = new FakeClock();
    const op = vi.fn(async (ctx: { attempt: number }) => {
      seen.push(ctx.attempt);
      if (ctx.attempt < 2) throw new Error('again');
      return 'ok';
    });
    const result = retry({ attempts: 5, backoff: () => 1, clock }).execute(op);
    await Promise.resolve();
    clock.advance(1);
    await Promise.resolve();
    await Promise.resolve();
    clock.advance(1);
    await Promise.resolve();
    await Promise.resolve();
    await expect(result).resolves.toBe('ok');
    expect(seen).toEqual([0, 1, 2]);
  });

  it('exponential() grows by factor', () => {
    const b = exponential(100, { factor: 2 });
    expect(b(0)).toBe(100);
    expect(b(1)).toBe(200);
    expect(b(2)).toBe(400);
  });
});
