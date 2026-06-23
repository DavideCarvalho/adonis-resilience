---
"@adonis-agora/resilience": minor
---

Add `@withResilience(...policies)` method decorator for declarative usage. It wraps a class method so calls run through `wrap(...policies)`, applying policies in the same outer→inner order as `wrap` (first argument is the outermost layer). Preserves `this`, arguments, and the return type. It's a plain TypeScript (TC39 stage-3) decorator with no container/DI dependency — pass an explicit `store` to any `circuitBreaker` policy, since there's no per-request container at decoration time.
