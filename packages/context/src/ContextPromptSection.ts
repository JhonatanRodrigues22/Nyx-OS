import type { ContextPromptSection, ContextResult } from "./ContextTypes";

export type ContextPromptSectionOptions = {
  name?: string;
  includeMetadata?: boolean;
};

export function toPromptSection(
  result: ContextResult,
  options: ContextPromptSectionOptions = {}
): ContextPromptSection {
  const content = result.sections
    .map((section) => [`[${section.sourceName}]`, section.content].join("\n"))
    .join("\n\n");
  const metadata = options.includeMetadata && result.omittedSources.length > 0
    ? `\n\n[omitted]\n${result.omittedSources.join("\n")}`
    : "";

  return {
    name: options.name ?? "context",
    content: `${content}${metadata}`.trim()
  };
}
