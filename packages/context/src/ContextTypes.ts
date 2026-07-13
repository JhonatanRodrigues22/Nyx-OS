export type ContextContribution = {
  sourceName: string;
  content: string;
  priority: number;
};

export type ContextRequest = {
  query?: string;
  maxChars: number;
};

export type ContextResult = {
  sections: ContextContribution[];
  truncated: boolean;
  omittedSources: string[];
};

export interface ContextSource {
  readonly name: string;
  collect(query?: string): Promise<ContextContribution>;
}

export type ContextPromptSection = {
  name: string;
  content: string;
};
