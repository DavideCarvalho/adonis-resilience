import type { ResilienceServiceOptions } from './resilience_service.js';

/** Shape of `config/resilience.ts`. See {@link ResilienceServiceOptions}. */
export interface ResilienceConfig extends ResilienceServiceOptions {}

/** Identity helper giving `config/resilience.ts` full type-checking. */
export function defineConfig(config: ResilienceConfig): ResilienceConfig {
  return config;
}
