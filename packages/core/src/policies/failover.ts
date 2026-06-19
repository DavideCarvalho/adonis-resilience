import { type EventSink, noopSink } from '../events.js';
import { type Policy, type PolicyContext, rootContext } from '../policy.js';

export interface FailoverOptions<TTarget, R> {
  targets: TTarget[];
  run: (target: TTarget, ctx: PolicyContext) => Promise<R>;
  policy?: (target: TTarget) => Policy;
  onFailover?: (target: TTarget, error: unknown, index: number) => void;
  onEvent?: EventSink;
}

export async function failover<TTarget, R>(opts: FailoverOptions<TTarget, R>): Promise<R> {
  if (opts.targets.length === 0) throw new Error('failover() needs at least one target.');
  const onEvent: EventSink = opts.onEvent ?? noopSink;
  let last: unknown;
  for (let i = 0; i < opts.targets.length; i++) {
    const target = opts.targets[i] as TTarget;
    const run = (ctx: PolicyContext) => opts.run(target, ctx);
    try {
      const policy = opts.policy?.(target);
      return policy ? await policy.execute(run) : await run(rootContext());
    } catch (err) {
      last = err;
      opts.onFailover?.(target, err, i);
      onEvent({ type: 'failover', target: String(target), index: i, error: err });
    }
  }
  throw last;
}
