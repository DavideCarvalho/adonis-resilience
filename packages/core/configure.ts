import type Configure from '@adonisjs/core/commands/configure';
import { stubsRoot } from './stubs/main.js';

/**
 * `node ace configure @agora/resilience` — registers the provider and publishes
 * `config/resilience.ts`.
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods();

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@agora/resilience/resilience_provider');
  });

  await codemods.makeUsingStub(stubsRoot, 'config/resilience.stub', {});
}
