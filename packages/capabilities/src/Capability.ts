import type { CapabilityContext } from "./CapabilityContext";
import type { CapabilityCategory, CapabilityMetadata } from "./CapabilityTypes";

export type MaybePromise<T> = T | Promise<T>;

export interface NyxCapability<TInput = unknown, TResult = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly category: CapabilityCategory;
  readonly tags: readonly string[];
  readonly enabled: boolean;
  readonly metadata: CapabilityMetadata;
  execute(context: CapabilityContext, input?: TInput): MaybePromise<TResult>;
}
