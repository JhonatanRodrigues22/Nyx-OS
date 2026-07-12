import type { PromptTemplate, PromptVariables, PromptVariableValue } from "./PromptTypes";

function stringifyPromptValue(value: PromptVariableValue): string {
  if (value === null) {
    return "";
  }

  return String(value);
}

export class PromptRenderer {
  render(template: PromptTemplate, variables: PromptVariables = {}): string {
    for (const variable of template.variables) {
      if (!(variable in variables)) {
        throw new Error(`Missing prompt variable: ${variable}`);
      }
    }

    return template.template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, variable: string) => {
      if (!(variable in variables)) {
        return match;
      }

      return stringifyPromptValue(variables[variable]);
    });
  }
}
