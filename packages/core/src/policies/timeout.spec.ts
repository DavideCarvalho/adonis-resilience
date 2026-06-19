import { describe, expect, it } from 'vitest';
import { FakeClock } from '../clock';
import { TimeoutError } from '../errors';
import { rootContext } from '../policy';
import { timeout } from './timeout';

describe('timeout', () => {
  it('passes through a fast result', async () => {
    const clock = new FakeClock();
    const p = timeout(100, { clock });
    await expect(p.execute(async () => 'ok')).resolves.toBe('ok');
  });

  it('rejects with TimeoutError when the op exceeds ms', async () => {
    const clock = new FakeClock();
    const p = timeout(100, { clock });
    const result = p.execute(() => new Promise(() => {})); // never resolves
    clock.advance(100);
    await expect(result).rejects.toBeInstanceOf(TimeoutError);
  });

  it('aborts the op signal on timeout', async () => {
    const clock = new FakeClock();
    const p = timeout(100, { clock });
    let aborted = false;
    const result = p.execute(
      (ctx) =>
        new Promise<never>((_, reject) => {
          ctx.signal.addEventListener('abort', () => {
            aborted = true;
            reject(ctx.signal.reason);
          });
        }),
    );
    clock.advance(100);
    await expect(result).rejects.toBeInstanceOf(TimeoutError);
    expect(aborted).toBe(true);
  });

  it('links the parent signal — aborting the parent aborts the op', async () => {
    const clock = new FakeClock();
    const parentAc = new AbortController();
    const p = timeout(1000, { clock });
    const result = p.execute(
      (ctx) =>
        new Promise<never>((_, reject) =>
          ctx.signal.addEventListener('abort', () => reject(ctx.signal.reason)),
        ),
      { signal: parentAc.signal, attempt: 0 },
    );
    parentAc.abort(new Error('parent gone'));
    await expect(result).rejects.toThrow('parent gone');
  });

  it('rejects immediately when the parent signal is already aborted before execute', async () => {
    const clock = new FakeClock();
    const ac = new AbortController();
    ac.abort(new Error('already gone'));
    const p = timeout(1000, { clock });
    const op = () => new Promise<never>(() => {});
    await expect(p.execute(op, { signal: ac.signal, attempt: 0 })).rejects.toThrow('already gone');
  });
});
