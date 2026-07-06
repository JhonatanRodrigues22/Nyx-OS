import type { ToolContext } from "./ToolContext";
import type { ToolCategory, ToolMetadata, ToolParameters, ToolResultDefinition } from "./ToolTypes";

export type MaybePromise<T> = T | Promise<T>;

export interface NyxTool<TInput = unknown, TResult = unknown> {
  readonly id: string;
  readonly capabilityId: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly category: ToolCategory;
  readonly enabled: boolean;
  readonly parameters: ToolParameters;
  readonly result: ToolResultDefinition;
  readonly metadata: ToolMetadata;
  execute(context: ToolContext, input?: TInput): MaybePromise<TResult>;
}
