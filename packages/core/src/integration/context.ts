/**
 * The global slot `@adonis-agora/context` publishes its read-only accessor under (in
 * addition to the container binding). Read structurally so resilience never
 * imports `@adonis-agora/context` — it degrades to `undefined` when context is absent.
 */
const CONTEXT_ACCESSOR = Symbol.for('@agora/context:accessor');

interface ContextAccessor {
  get(): { tenantId?: string } | undefined;
}

/** Read the current tenant from `@adonis-agora/context` if installed, else `undefined`. */
export function tenantSuffix(): string | undefined {
  const accessor = (globalThis as Record<symbol, unknown>)[CONTEXT_ACCESSOR] as
    | ContextAccessor
    | undefined;
  return accessor?.get?.()?.tenantId;
}
