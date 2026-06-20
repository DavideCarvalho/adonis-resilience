import type { ApplicationService } from '@adonisjs/core/types';
import type { ResilienceStore } from '../src/breaker/store.js';
import type { ResilienceConfig } from '../src/define_config.js';
import { ResilienceService } from '../src/resilience_service.js';

/**
 * Wires `@agora/resilience` into the AdonisJS application: binds a singleton
 * {@link ResilienceService} built from `config/resilience.ts`.
 *
 * ```ts
 * const resilience = await app.container.make(ResilienceService)
 * await resilience.execute('db', () => query())
 * ```
 *
 * The binding factory is lazy and async, so config is read on first resolve (after the config
 * phase). The circuit store is selected by `config.default` from `config.stores` (built with the
 * `stores` factory); each store thunk lazily imports its peer dependency (`@adonisjs/lucid`,
 * `@adonisjs/redis`) only when that store is actually selected. An explicit `config.store` still
 * wins when provided.
 */
export default class ResilienceProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(ResilienceService, async () => {
      const config = this.app.config.get<ResilienceConfig>('resilience', {});
      const { default: defaultStore, stores: providers, store, ...rest } = config;

      // Build every configured store thunk once, resolving its (optional) peer dependency.
      const resolved: Record<string, ResilienceStore> = {};
      if (providers) {
        for (const [name, provider] of Object.entries(providers)) {
          resolved[name] = await provider({ app: this.app });
        }
      }

      if (defaultStore && !providers?.[defaultStore]) {
        throw new Error(
          `@agora/resilience: config.default is "${defaultStore}", but config.stores.${defaultStore} is not defined`,
        );
      }

      return new ResilienceService({
        ...rest,
        ...(store !== undefined ? { store } : {}),
        ...(defaultStore !== undefined ? { defaultStore } : {}),
        stores: resolved,
      });
    });
  }
}
