export type PromptVariableValue = string | number | boolean | null;

export type PromptVariables = Record<string, PromptVariableValue>;

export type PromptTemplate = {
  id: string;
  version: string;
  description: string;
  template: string;
  variables: string[];
};

export type PromptSection = {
  name: string;
  content: string;
};

export type PromptTemplateReference = {
  id: string;
  version?: string;
  variables?: PromptVariables;
};
