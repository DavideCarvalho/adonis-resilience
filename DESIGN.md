# `@agora/resilience` — DESIGN

> Port of `@dudousxd/nestjs-resilience` (aviary) to AdonisJS (Agora).

## 1. Núcleo (framework-agnostic, portado verbatim)

Policies (`timeout`, `retry`+`exponential`, `wrap`, `circuitBreaker`, `failover`),
máquina de estado do breaker, stores (`InMemoryResilienceStore`,
`SqlResilienceStore` agnóstico sobre `SqlDriver`), `clock`, `errors`, `events`,
`policy`. Tudo puro — copiado sem mudança (só `.js` nos imports p/ NodeNext).

## 2. O que mudou Nest → Adonis

O Nest usava `@CircuitBreaker`/`@Retry`/`@Timeout` + explorer escaneando providers.
Adonis não tem esse scan idiomático — **dropei decorators/explorer**. O uso é:
- compor policies como funções (`wrap(timeout(…), retry(…))`), ou
- registrar policies nomeadas no `config/resilience.ts` e rodar via
  `ResilienceService.execute('nome', op)`.

`ResilienceService` é o port do serviço Nest, construído a partir do
`config/resilience.ts` em vez de tokens DI; resolvido via container singleton.

## 3. Integrações via slots globais (contrato do ecossistema)

Sem dependência hard entre repos. resilience lê dois `Symbol.for` globais:
- `@agora/diagnostics:emit` — republica eventos em `agora:resilience:<type>` se o
  diagnostics estiver instalado (no-op se ausente).
- `@agora/context:accessor` — `tenantSuffix()` lê o tenant atual p/ chaves de
  circuito por tenant.

Isso deixa cada repo buildar/testar isolado, sem precisar publicar os outros.

## 4. Wiring Adonis

- **Provider**: binda `ResilienceService` como singleton (factory lazy lê o config).
- **`node ace configure @agora/resilience`**: registra o provider + publica
  `config/resilience.ts`.

## 5. Stores

- Stores selecionados em `config/resilience.ts` via a factory `stores`
  (`stores.memory()`, `stores.lucid()`, `stores.redis()`), todos no pacote core.
  Os drivers Lucid/Redis importam o peer (`@adonisjs/lucid`, `@adonisjs/redis`)
  de forma lazy, só quando selecionados — peers opcionais.
- `SqlResilienceStore` (agnóstico) continua exportado para outros engines SQL
  via um `SqlDriver` fino.
- **Follow-up:** drivers para prisma/typeorm/mikro-orm/drizzle sobre o
  `SqlResilienceStore`.

## 6. Não-objetivos

- Não é dashboard (isso é telescope). Só emite os eventos que ele grava.
