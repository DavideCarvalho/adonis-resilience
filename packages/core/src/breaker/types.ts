export type CircuitStatus = 'closed' | 'open' | 'half-open';

export interface CircuitSnapshot {
  status: CircuitStatus;
  failures: number;
  openUntil?: number;
}

export interface BreakerConfig {
  threshold: number;
  cooldownMs: number;
  /** Max concurrent probes allowed in half-open. Default 1. */
  halfOpenMax?: number;
}

export interface Admission {
  allow: boolean;
  probe: boolean;
  status: CircuitStatus;
}
