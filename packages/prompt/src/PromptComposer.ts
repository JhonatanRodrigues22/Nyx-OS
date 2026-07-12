import type { PromptSection } from "./PromptTypes";

export class PromptComposer {
  constructor(private readonly separator = "\n\n") {}

  compose(sections: PromptSection[]): string {
    return sections.map((section) => section.content.trim()).filter(Boolean).join(this.separator);
  }
}
