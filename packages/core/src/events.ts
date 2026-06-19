export type ResilienceEventType =
  | 'circuit-opened'
  | 'circuit-closed'
  | 'circuit-half-open'
  | 'short-circuited'
  | 'failover'
  | 'timeout'
  | 'retry';

export interface ResilienceEvent {
  type: ResilienceEventType;
  key?: string;
  [extra: string]: unknown;
}

export type EventSink = (event: ResilienceEvent) => void;

export const noopSink: EventSink = () => {};

/** Fan one event out to several sinks (errors in one do not stop the others). */
export function combineSinks(...sinks: EventSink[]): EventSink {
  const active = sinks.filter((s): s is EventSink => typeof s === 'function');
  if (active.length === 0) return noopSink;
  if (active.length === 1) return active[0] as EventSink;
  return (event) => {
    for (const s of active) {
      try {
        s(event);
      } catch {
        // a misbehaving sink must not break the others or the policy
      }
    }
  };
}
