export class TimeoutError extends Error {
  constructor(readonly ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export class BrokenCircuitError extends Error {
  constructor(readonly key: string) {
    super(`Circuit "${key}" is open`);
    this.name = 'BrokenCircuitError';
  }
}
