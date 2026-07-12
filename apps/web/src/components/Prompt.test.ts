import { PromptComposer, PromptRegistry, PromptRenderer, type PromptTemplate } from "@nyx-os/prompt";

function createTemplate(overrides: Partial<PromptTemplate> = {}): PromptTemplate {
  return {
    id: "nyx.system",
    version: "1.0.0",
    description: "System prompt template for tests",
    template: "You are {{name}} running in {{mode}}.",
    variables: ["name", "mode"],
    ...overrides
  };
}

describe("Prompt Engine", () => {
  it("registers a valid template", () => {
    const registry = new PromptRegistry();
    const template = createTemplate();

    const registered = registry.register(template);

    expect(registered).toEqual(template);
    expect(registry.list()).toEqual([template]);
  });

  it("rejects duplicate id and version registrations", () => {
    const registry = new PromptRegistry();
    const template = createTemplate();

    registry.register(template);

    expect(() => registry.register(template)).toThrow("Prompt template already registered: nyx.system@1.0.0");
  });

  it("resolves the latest version when only id is provided", () => {
    const registry = new PromptRegistry();

    registry.register(createTemplate({ version: "1.0.0", template: "old", variables: [] }));
    registry.register(createTemplate({ version: "1.2.0", template: "new", variables: [] }));
    registry.register(createTemplate({ version: "1.1.0", template: "middle", variables: [] }));

    expect(registry.require("nyx.system").version).toBe("1.2.0");
  });

  it("renders a template when all variables are present", () => {
    const renderer = new PromptRenderer();
    const template = createTemplate();

    const rendered = renderer.render(template, {
      name: "Nyx OS",
      mode: "test"
    });

    expect(rendered).toBe("You are Nyx OS running in test.");
  });

  it("throws an explicit error when a declared variable is missing", () => {
    const renderer = new PromptRenderer();
    const template = createTemplate();

    expect(() =>
      renderer.render(template, {
        name: "Nyx OS"
      })
    ).toThrow("Missing prompt variable: mode");
  });

  it("throws an explicit error when a placeholder has no provided value", () => {
    const renderer = new PromptRenderer();
    const template = createTemplate({
      template: "You are {{name}} running in {{mode}}.",
      variables: ["name"]
    });

    expect(() =>
      renderer.render(template, {
        name: "Nyx OS"
      })
    ).toThrow("Missing prompt variable: mode");
  });

  it("rejects templates with undeclared placeholders on registration", () => {
    const registry = new PromptRegistry();
    const template = createTemplate({
      template: "You are {{name}} running in {{mode}}.",
      variables: ["name"]
    });

    expect(() => registry.register(template)).toThrow(
      "Prompt template nyx.system@1.0.0 has undeclared variables: mode"
    );
  });

  it("composes multiple sections in order", () => {
    const composer = new PromptComposer();

    const prompt = composer.compose([
      {
        name: "system",
        content: "System instructions."
      },
      {
        name: "tools",
        content: "Tool instructions."
      },
      {
        name: "context",
        content: "Context block."
      }
    ]);

    expect(prompt).toBe("System instructions.\n\nTool instructions.\n\nContext block.");
  });
});
