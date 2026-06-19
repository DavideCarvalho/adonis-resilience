import { InMemoryResilienceStore } from './breaker/in-memory.store.js';
import type { ResilienceStore } from './breaker/store.js';
import type { CircuitSnapshot } from './breaker/types.js';
import { type EventSink, combineSinks, noopSink } from './events.js';
import { diagnosticsSink } from './integration/diagnostics.js';
import { type EventEmitterLike, eventEmitterSink } from './integration/event-emitter.js';
import { type FailoverOptions, failover } from './policies/failover.js';
import type { Operation, Policy } from './policy.js';

/** Options for {@link ResilienceService} — the shape of `config/resilience.ts`. */
export interface ResilienceServiceOptions {
  /** Circuit-breaker store. Defaults to an in-process {@link InMemoryResilienceStore}. */
  store?: ResilienceStore;
  /** Named, reusable policy factories resolvable by name in {@link ResilienceService.execute}. */
  policies?: Record<string, () => Policy>;
  /** Emit diagnostics events on `agora:resilience:*`. Default true. */
  emit?: boolean;
  /** Mirror resilience events to an EventEmitter2-style emitter as well. */
  eventEmitter?: EventEmitterLike;
}

/**
 * The container-resolved entry point for resilience. Holds the configured store
 * and event sink, runs operations through named or ad-hoc policies, and exposes
 * failover + per-circuit inspection/reset.
 *
 * The AdonisJS counterpart of the NestJS `ResilienceService` — same surface, but
 * constructed from `config/resilience.ts` instead of DI tokens, and without the
 * decorator/explorer path (wrap your operations with the exported policy
 * functions, or register named policies here).
 */
export class ResilienceService {
  readonly sink: EventSink;
  readonly store: ResilienceStore;
  private readonly policies: Record<string, () => Policy>;

  constructor(options: ResilienceServiceOptions = {}) {
    this.store = options.store ?? new InMemoryResilienceStore();
    const base = options.emit === false ? noopSink : diagnosticsSink();
    this.sink = options.eventEmitter
      ? combineSinks(base, eventEmitterSink(options.eventEmitter))
      : base;
    this.policies = options.policies ?? {};
  }

  /** Run `op` through a named policy or an ad-hoc {@link Policy}. */
  execute<T>(policy: string | Policy, op: Operation<T>): Promise<T> {
    const resolved = typeof policy === 'string' ? this.resolve(policy) : policy;
    return resolved.execute(op);
  }

  /** Ordered failover across targets, wired to this service's event sink. */
  failover<TTarget, R>(opts: FailoverOptions<TTarget, R>): Promise<R> {
    return failover({ onEvent: this.sink, ...opts });
  }

  /** Inspect or reset a single circuit by key. */
  circuit(key: string) {
    const store = this.store;
    return {
      snapshot: (): Promise<CircuitSnapshot> => store.snapshot(key),
      reset: async (): Promise<void> => {
        await store.record(key, { threshold: 1, cooldownMs: 0 }, true, false);
      },
    };
  }

  private resolve(name: string): Policy {
    const factory = this.policies[name];
    if (!factory) throw new Error(`Unknown resilience policy "${name}".`);
    return factory();
  }
}
