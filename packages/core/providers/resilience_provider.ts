import type { ApplicationService } from '@adonisjs/core/types';
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
 * The binding factory is lazy, so config is read on first resolve (after the
 * config phase), and the store/event sink come straight from the config file.
 */
export default class ResilienceProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(ResilienceService, () => {
      const config = this.app.config.get<ResilienceConfig>('resilience', {});
      return new ResilienceService(config);
    });
  }
}
