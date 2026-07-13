import {
  ContextEngine,
  RuntimeStateContextSource,
  toPromptSection,
  type ContextSource
} from "@nyx-os/context";
import { InMemoryNyxStateService } from "@nyx-os/state";

function createSource(name: string, content: string, priority: number): ContextSource {
  return {
    name,
    async collect() {
      return {
        sourceName: name,
        content,
        priority
      };
    }
  };
}

describe("Context Engine", () => {
  it("builds context with all sources when they fit the budget", async () => {
    const engine = new ContextEngine({
      sources: [
        createSource("memory", "memory context", 70),
        createSource("state", "state context", 100),
        createSource("knowledge", "knowledge context", 60)
      ]
    });

    const result = await engine.build({
      query: "nyx",
      maxChars: 100
    });

    expect(result.sections.map((section) => section.sourceName)).toEqual(["state", "memory", "knowledge"]);
    expect(result.truncated).toBe(false);
    expect(result.omittedSources).toEqual([]);
  });

  it("truncates lower priority sources when the budget is exceeded", async () => {
    const engine = new ContextEngine({
      sources: [
        createSource("high", "12345", 100),
        createSource("middle", "abcde", 70),
        createSource("low", "xyz", 10)
      ]
    });

    const result = await engine.build({
      maxChars: 8
    });

    expect(result.sections).toEqual([
      {
        sourceName: "high",
        content: "12345",
        priority: 100
      },
      {
        sourceName: "middle",
        content: "abc",
        priority: 70
      }
    ]);
    expect(result.truncated).toBe(true);
    expect(result.omittedSources).toEqual([
      "middle: content truncated by context budget",
      "low: context budget exceeded"
    ]);
  });

  it("isolates source failures and keeps successful contributions", async () => {
    const failingSource: ContextSource = {
      name: "knowledge",
      async collect() {
        throw new Error("search unavailable");
      }
    };
    const engine = new ContextEngine({
      sources: [createSource("memory", "memory context", 70), failingSource]
    });

    const result = await engine.build({
      query: "nyx",
      maxChars: 100
    });

    expect(result.sections.map((section) => section.sourceName)).toEqual(["memory"]);
    expect(result.truncated).toBe(false);
    expect(result.omittedSources).toEqual(["knowledge: search unavailable"]);
  });

  it("converts context results to a prompt section", () => {
    const section = toPromptSection(
      {
        sections: [
          {
            sourceName: "memory",
            content: "memory context",
            priority: 70
          },
          {
            sourceName: "knowledge",
            content: "knowledge context",
            priority: 60
          }
        ],
        truncated: false,
        omittedSources: []
      },
      {
        name: "context"
      }
    );

    expect(section).toEqual({
      name: "context",
      content: "[memory]\nmemory context\n\n[knowledge]\nknowledge context"
    });
  });

  it("summarizes runtime state through the runtime state source", async () => {
    const state = new InMemoryNyxStateService(() => new Date("2026-07-13T00:00:00.000Z"));

    state.initializeRuntime({
      status: "running",
      version: "0.1.0",
      environment: "test",
      services: [
        {
          name: "logger",
          status: "running",
          dependencies: []
        }
      ]
    });
    state.updateRuntimeStatus("running");

    const source = new RuntimeStateContextSource({ state });
    const contribution = await source.collect();

    expect(contribution.sourceName).toBe("runtime-state");
    expect(contribution.content).toContain("Runtime status: running");
    expect(contribution.content).toContain("Services running: 1/1");
  });
});
