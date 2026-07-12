import { CapabilityManager, type CapabilityContext, type NyxCapability } from "@nyx-os/capabilities";
import { AiConversationManager, AiProviderRegistry, FakeAiProvider, type AiProvider } from "@nyx-os/ai";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createConsoleLogger } from "@nyx-os/logger";
import { MemoryManager } from "@nyx-os/memory";
import { PromptRegistry, PromptRenderer } from "@nyx-os/prompt";
import { SchedulerManager } from "@nyx-os/scheduler";
import { ToolManager, type NyxTool, type ToolContext } from "@nyx-os/tools";

function createCapability(id = "ai.test"): NyxCapability {
  return {
    id,
    name: "AI Test Capability",
    description: "Capability used by AI Runtime tests",
    version: "0.1.0",
    category: "custom",
    tags: ["ai"],
    enabled: true,
    metadata: {},
    execute: () => ({ ok: true })
  };
}

function createHarness(provider: AiProvider) {
  const events = createInMemoryEventBus<NyxSystemEvents>();
  const logger = createConsoleLogger();
  const memory = new MemoryManager({ events });
  const scheduler = new SchedulerManager({ events, logger });
  const toolInputs: unknown[] = [];
  const capabilities = new CapabilityManager({
    events,
    createContext: (): CapabilityContext => ({
      runtime: {
        getEventBus: () => events,
        getMemory: () => memory
      },
      logger,
      config: {
        appName: "Nyx OS",
        version: "0.1.0",
        environment: "test",
        enabledModules: ["core", "events", "dashboard"],
        ai: {
          provider: "fake",
          model: "fake"
        },
        featureFlags: {
          useMockData: true,
          enablePersistentMemory: false,
          enableAutomation: false,
          enableAiRuntime: false
        }
      },
      memory,
      eventBus: events,
      services: {
        list: () => []
      },
      scheduler
    })
  });
  const tools = new ToolManager({
    events,
    capabilities,
    createContext: (): ToolContext => ({
      runtime: {
        getCapabilities: () => capabilities,
        getEventBus: () => events,
        getMemory: () => memory
      },
      logger,
      config: {
        appName: "Nyx OS",
        version: "0.1.0",
        environment: "test",
        enabledModules: ["core", "events", "dashboard"],
        ai: {
          provider: "fake",
          model: "fake"
        },
        featureFlags: {
          useMockData: true,
          enablePersistentMemory: false,
          enableAutomation: false,
          enableAiRuntime: false
        }
      },
      memory,
      scheduler,
      eventBus: events,
      services: {
        list: () => []
      },
      capabilities
    })
  });
  const tool: NyxTool = {
    id: "ai.test.tool",
    capabilityId: "ai.test",
    name: "AI Test Tool",
    description: "Tool used by AI Runtime tests",
    version: "0.1.0",
    category: "custom",
    enabled: true,
    parameters: {
      value: {
        type: "string",
        required: false
      }
    },
    result: {
      description: "Tool result"
    },
    metadata: {},
    execute: (_context, input) => {
      toolInputs.push(input ?? {});
      return {
        ok: true,
        input
      };
    }
  };
  const providers = new AiProviderRegistry();

  capabilities.register(createCapability());
  tools.register(tool);
  providers.register("fake", provider);

  return {
    ai: new AiConversationManager({ providers, tools, maxIterations: 3 }),
    providers,
    provider,
    tools,
    toolInputs
  };
}

describe("Nyx AI Runtime", () => {
  it("completes a simple conversation without tool calls", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: "Hello from Nyx."
        },
        stopReason: "stop"
      }
    ]);
    const { ai } = createHarness(provider);

    const result = await ai.sendUserMessage("hello");

    expect(result.response.message.content).toBe("Hello from Nyx.");
    expect(result.iterations).toBe(1);
    expect(result.messages.map((message) => message.role)).toEqual(["user", "assistant"]);
    expect(provider.requests[0].tools?.map((tool) => tool.id)).toEqual(["ai.test.tool"]);
  });

  it("executes a tool call and returns the final provider response", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: ""
        },
        toolCalls: [
          {
            toolId: "ai.test.tool",
            input: {
              value: "nyx"
            }
          }
        ],
        stopReason: "tool_call"
      },
      {
        message: {
          role: "assistant",
          content: "Tool result consumed."
        },
        stopReason: "stop"
      }
    ]);
    const { ai, toolInputs } = createHarness(provider);

    const result = await ai.sendUserMessage("use a tool");

    expect(toolInputs).toEqual([{ value: "nyx" }]);
    expect(result.response.message.content).toBe("Tool result consumed.");
    expect(result.iterations).toBe(2);
    expect(result.messages.map((message) => message.role)).toEqual(["user", "assistant", "tool", "assistant"]);
  });

  it("preserves provider tool call IDs in tool result messages", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: ""
        },
        toolCalls: [
          {
            toolId: "ai.test.tool",
            toolCallId: "toolu_manager",
            input: {
              value: "nyx"
            }
          }
        ],
        stopReason: "tool_call"
      },
      {
        message: {
          role: "assistant",
          content: "Tool result consumed."
        },
        stopReason: "stop"
      }
    ]);
    const { ai } = createHarness(provider);

    const result = await ai.sendUserMessage("use a tool");
    const toolMessage = result.messages.find((message) => message.role === "tool");

    expect(toolMessage?.toolCallId).toBe("toolu_manager");
  });

  it("uses an injected prompt template resolver for the system prompt", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: "Hello from template."
        },
        stopReason: "stop"
      }
    ]);
    const { providers, tools } = createHarness(provider);
    const registry = new PromptRegistry();
    const renderer = new PromptRenderer();

    registry.register({
      id: "nyx.system",
      version: "1.0.0",
      description: "System prompt template for AI tests",
      template: "You are {{name}} in {{mode}} mode.",
      variables: ["name", "mode"]
    });

    const templatedAi = new AiConversationManager({
      providers,
      tools,
      systemPromptTemplate: {
        id: "nyx.system",
        variables: {
          name: "Nyx OS",
          mode: "test"
        }
      },
      systemPromptResolver: {
        renderSystemPrompt: (reference) =>
          renderer.render(registry.require(reference.id, reference.version), reference.variables ?? {})
      }
    });

    await templatedAi.sendUserMessage("hello");

    expect(provider.requests[0].messages[0]).toEqual({
      role: "system",
      content: "You are Nyx OS in test mode."
    });
  });

  it("treats an empty system prompt as an explicit override", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: "Hello without system prompt."
        },
        stopReason: "stop"
      }
    ]);
    const { ai } = createHarness(provider);

    await ai.sendUserMessage("hello", {
      systemPrompt: ""
    });

    expect(provider.requests[0].messages[0]).toEqual({
      role: "system",
      content: ""
    });
  });

  it("fails explicitly when the tool loop reaches the iteration limit", async () => {
    const provider = new FakeAiProvider([
      {
        message: {
          role: "assistant",
          content: ""
        },
        toolCalls: [{ toolId: "ai.test.tool" }],
        stopReason: "tool_call"
      },
      {
        message: {
          role: "assistant",
          content: ""
        },
        toolCalls: [{ toolId: "ai.test.tool" }],
        stopReason: "tool_call"
      },
      {
        message: {
          role: "assistant",
          content: ""
        },
        toolCalls: [{ toolId: "ai.test.tool" }],
        stopReason: "tool_call"
      }
    ]);
    const { ai } = createHarness(provider);

    await expect(ai.sendUserMessage("loop")).rejects.toThrow("AI tool loop exceeded max iterations");
  });

  it("propagates provider errors", async () => {
    const provider: AiProvider = {
      complete() {
        throw new Error("provider unavailable");
      },
      async *stream() {
        throw new Error("provider unavailable");
      }
    };
    const { ai } = createHarness(provider);

    await expect(ai.sendUserMessage("hello")).rejects.toThrow("provider unavailable");
  });
});
