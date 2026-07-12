import type { PromptTemplate } from "./PromptTypes";

function templateKey(id: string, version: string): string {
  return `${id}@${version}`;
}

function compareVersion(left: string, right: string): number {
  const leftParts = left.split(".");
  const rightParts = right.split(".");
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? "0";
    const rightPart = rightParts[index] ?? "0";
    const leftNumber = Number(leftPart);
    const rightNumber = Number(rightPart);

    if (Number.isInteger(leftNumber) && Number.isInteger(rightNumber) && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    if (leftPart !== rightPart) {
      return leftPart.localeCompare(rightPart);
    }
  }

  return 0;
}

export class PromptRegistry {
  private readonly templates = new Map<string, PromptTemplate>();

  register(template: PromptTemplate): PromptTemplate {
    const key = templateKey(template.id, template.version);

    if (this.templates.has(key)) {
      throw new Error(`Prompt template already registered: ${template.id}@${template.version}`);
    }

    this.templates.set(key, {
      ...template,
      variables: [...template.variables]
    });

    return this.require(template.id, template.version);
  }

  get(id: string, version?: string): PromptTemplate | undefined {
    if (version) {
      return this.clone(this.templates.get(templateKey(id, version)));
    }

    const versions = Array.from(this.templates.values()).filter((template) => template.id === id);
    const latest = versions.sort((left, right) => compareVersion(right.version, left.version))[0];

    return this.clone(latest);
  }

  require(id: string, version?: string): PromptTemplate {
    const template = this.get(id, version);

    if (!template) {
      throw new Error(version ? `Prompt template not registered: ${id}@${version}` : `Prompt template not registered: ${id}`);
    }

    return template;
  }

  list(): PromptTemplate[] {
    return Array.from(this.templates.values()).map((template) => this.clone(template));
  }

  private clone(template: PromptTemplate | undefined): PromptTemplate | undefined {
    if (!template) {
      return undefined;
    }

    return {
      ...template,
      variables: [...template.variables]
    };
  }
}
