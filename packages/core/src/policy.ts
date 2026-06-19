export interface PolicyContext {
  signal: AbortSignal;
  attempt: number;
}

export type Operation<T> = (ctx: PolicyContext) => Promise<T>;

export interface Policy {
  execute<T>(op: Operation<T>, parent?: PolicyContext): Promise<T>;
}

/** A signal that never aborts — the root of a policy chain. */
export function rootContext(): PolicyContext {
  return { signal: new AbortController().signal, attempt: 0 };
}
