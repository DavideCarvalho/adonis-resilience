import { type Operation, type Policy, type PolicyContext, rootContext } from '../policy.js';

export function wrap(...policies: Policy[]): Policy {
  return {
    execute<T>(op: Operation<T>, parent: PolicyContext = rootContext()): Promise<T> {
      const composed = policies.reduceRight<Operation<T>>(
        (innerOp, policy) => (ctx) => policy.execute(innerOp, ctx),
        op,
      );
      return composed(parent);
    },
  };
}
