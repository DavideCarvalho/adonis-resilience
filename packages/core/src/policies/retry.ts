import { type Clock, systemClock } from '../clock.js';
import { type Operation, type Policy, type PolicyContext, rootContext } from '../policy.js';

export type Backoff = (attempt: number) => number;

export function exponential(
  baseMs: number,
  opts: { jitter?: boolean; factor?: number } = {},
): Backoff {
  const factor = opts.factor ?? 2;
  return (attempt) => {
    const raw = baseMs * factor ** attempt;
    if (!opts.jitter) return raw;
    // full jitter: a deterministic-enough spread without Math.random in tests is fine in prod
    return Math.round(raw * (0.5 + Math.random() / 2));
  };
}

export function retry(opts: { attempts: number; backoff?: Backoff; clock?: Clock }): Policy {
  const clock = opts.clock ?? systemClock;
  const backoff = opts.backoff ?? (() => 0);
  return {
    async execute<T>(op: Operation<T>, parent: PolicyContext = rootContext()): Promise<T> {
      let last: unknown;
      for (let attempt = 0; attempt < opts.attempts; attempt++) {
        try {
          return await op({ signal: parent.signal, attempt });
        } catch (err) {
          last = err;
          if (attempt < opts.attempts - 1) await clock.delay(backoff(attempt), parent.signal);
        }
      }
      throw last;
    },
  };
}
