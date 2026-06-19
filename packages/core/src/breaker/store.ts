import type { Admission, BreakerConfig, CircuitSnapshot, CircuitStatus } from './types.js';

/**
 * Pluggable storage interface for circuit-breaker state.
 *
 * **Atomicity contract (MUST be honoured by all implementations):**
 * Both `admit` and `record` must execute as atomic operations — no lost updates,
 * no double-counted failures, and exactly one half-open probe granted under concurrent calls.
 * The built-in `InMemoryResilienceStore` satisfies this for free via JavaScript's
 * single-threaded run-to-completion model. Distributed adapters (Redis, database-backed,
 * etc.) MUST enforce atomicity explicitly — for example via Lua scripts, WATCH/MULTI/EXEC
 * transactions, or compare-and-swap (CAS) primitives — to avoid race conditions that would
 * cause incorrect circuit state.
 */
export interface ResilienceStore {
  /** Decide whether a call may proceed; atomically flip open→half-open after cooldown and hand the
   *  probe slot to one caller. */
  admit(key: string, cfg: BreakerConfig): Promise<Admission>;
  /** Record an outcome; atomically update counters/state and return the resulting status. */
  record(key: string, cfg: BreakerConfig, ok: boolean, probe: boolean): Promise<CircuitStatus>;
  /** Read-only snapshot. */
  snapshot(key: string): Promise<CircuitSnapshot>;
}
