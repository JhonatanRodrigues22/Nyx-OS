import { NyxRuntime } from "@nyx-os/core";
import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { createEventBus } from "@nyx-os/events";
import { MemoryManager } from "@nyx-os/memory";
import type { NyxPlugin } from "@nyx-os/plugin";

describe("Nyx memory engine", () => {
  it("creates, reads, updates, lists and deletes textual memories", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const memory = new MemoryManager({
      events,
      idFactory: () => "memory-1",
      now: () => "2026-07-05T00:00:00.000Z"
    });

    const created = memory.create({
      title: "Project note",
      content: "Nyx memory stores textual context.",
      category: "project",
      tags: ["Nyx", "Memory", "nyx"],
      importance: 8
    });

    expect(created).toMatchObject({
      id: "memory-1",
      category: "project",
      tags: ["nyx", "memory"],
      importance: 8
    });
    expect(memory.get("memory-1")?.title).toBe("Project note");

    const updated = memory.update("memory-1", {
      title: "Updated project note",
      tags: ["project", "context"]
    });

    expect(updated.title).toBe("Updated project note");
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.tags).toEqual(["project", "context"]);
    expect(memory.list()).toHaveLength(1);

    memory.delete("memory-1");

    expect(memory.get("memory-1")).toBeUndefined();
  });

  it("searches memories by text, category, tags and id", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const memory = new MemoryManager({ events });

    memory.create({
      id: "knowledge-1",
      title: "Runtime architecture",
      content: "Runtime coordinates services without owning product logic.",
      category: "knowledge",
      tags: ["runtime", "architecture"],
      importance: 7
    });
    memory.create({
      id: "user-1",
      title: "User preference",
      content: "Prefers low-friction capture.",
      category: "user",
      tags: ["preference"],
      importance: 5
    });

    expect(memory.search({ text: "services" }).map((result) => result.memory.id)).toEqual(["knowledge-1"]);
    expect(memory.findByCategory("user").map((item) => item.id)).toEqual(["user-1"]);
    expect(memory.findByTags(["runtime"]).map((item) => item.id)).toEqual(["knowledge-1"]);
    expect(memory.search({ id: "user-1" })[0].memory.title).toBe("User preference");
  });

  it("emits memory lifecycle and search events", () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const memory = new MemoryManager({ events });
    const received: string[] = [];

    events.on("memory.created", (event) => received.push(event.name));
    events.on("memory.saved", (event) => received.push(event.name));
    events.on("memory.loaded", (event) => received.push(event.name));
    events.on("memory.updated", (event) => received.push(event.name));
    events.on("memory.search", (event) => received.push(event.name));
    events.on("memory.deleted", (event) => received.push(event.name));

    memory.create({
      id: "event-memory",
      title: "Event memory",
      content: "Memory events are emitted through the official event bus.",
      category: "system"
    });
    memory.get("event-memory");
    memory.update("event-memory", { content: "Updated content." });
    memory.search({ text: "updated" });
    memory.delete("event-memory");

    expect(received).toEqual([
      "memory.created",
      "memory.saved",
      "memory.loaded",
      "memory.updated",
      "memory.saved",
      "memory.search",
      "memory.deleted"
    ]);
  });

  it("exposes memory through the runtime and plugin context", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const runtime = new NyxRuntime(createEventBus(), undefined, {
      events,
      registerBasePlugins: false
    });
    const plugin: NyxPlugin = {
      id: "memory-test-plugin",
      name: "Memory Test Plugin",
      version: "0.1.0",
      initialize(context) {
        context.memory.create({
          id: "plugin-memory",
          title: "Plugin memory",
          content: "Plugins can create and query memories through context.memory.",
          category: "system",
          tags: ["plugin", "memory"]
        });

        expect(context.memory.get("plugin-memory")).toBeDefined();
        expect(context.memory.list()).toHaveLength(1);
      }
    };

    runtime.registerPlugin(plugin);
    await runtime.start();

    expect(runtime.getMemory().get("plugin-memory")?.title).toBe("Plugin memory");
    expect(runtime.getSnapshot().memory.total).toBe(1);

    await runtime.stop();
  });

  it("initializes the built-in MemoryPlugin without business logic", async () => {
    const events = createInMemoryEventBus<NyxSystemEvents>();
    const runtime = new NyxRuntime(createEventBus(), undefined, { events });
    const received: string[] = [];

    events.on("memory.created", (event) => received.push(event.name));
    events.on("memory.search", (event) => received.push(event.name));

    await runtime.start();

    expect(runtime.getPlugin("memory-plugin")).toBeDefined();
    expect(runtime.getMemory().get("memory.runtime.diagnostics")).toMatchObject({
      category: "system",
      source: {
        type: "plugin",
        id: "memory-plugin"
      }
    });
    expect(received).toEqual(expect.arrayContaining(["memory.created", "memory.search"]));

    await runtime.stop();
  });
});
