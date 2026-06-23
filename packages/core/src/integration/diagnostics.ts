import type { EventSink } from '../events.js';

type EmitFn = (lib: string, event: string, payload: unknown) => void;

/**
 * The global slot `@adonis-agora/diagnostics` publishes its `emit` under. Read
 * structurally so resilience never imports `@adonis-agora/diagnostics` — it degrades to
 * a no-op when diagnostics is not installed. See the `@adonis-agora/diagnostics`
 * decoupling contract.
 */
const EMIT_SLOT = Symbol.for('@agora/diagnostics:emit');

/**
 * An {@link EventSink} that republishes every resilience event onto the Agora
 * diagnostics bus as `agora:resilience:<type>`, when `@adonis-agora/diagnostics` is
 * installed. `emit` is free when nothing is subscribed, so this stays cheap by
 * default; a Telescope watcher (or any `onDiagnostic('resilience', …)` handler)
 * records it when present.
 */
export function diagnosticsSink(): EventSink {
  return (event) => {
    const emit = (globalThis as Record<symbol, unknown>)[EMIT_SLOT] as EmitFn | undefined;
    emit?.('resilience', event.type, event);
  };
}
