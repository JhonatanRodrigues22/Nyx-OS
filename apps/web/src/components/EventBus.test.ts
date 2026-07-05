import { createInMemoryEventBus } from "@nyx-os/event-bus";

type TestEvents = {
  "sample.event": { value: number };
  "ordered.event": { step: string };
  "optional.event": undefined;
};

describe("Nyx event bus", () => {
  it("subscribes and emits typed events", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: number[] = [];

    eventBus.on("sample.event", (event) => {
      received.push(event.payload?.value ?? 0);
    });

    const event = eventBus.emit("sample.event", { value: 42 });

    expect(event.name).toBe("sample.event");
    expect(event.payload).toEqual({ value: 42 });
    expect(received).toEqual([42]);
  });

  it("unsubscribes listeners", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: number[] = [];

    const unsubscribe = eventBus.on("sample.event", (event) => {
      received.push(event.payload?.value ?? 0);
    });

    unsubscribe();
    eventBus.emit("sample.event", { value: 1 });

    expect(received).toEqual([]);
  });

  it("runs once listeners a single time", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: number[] = [];

    eventBus.once("sample.event", (event) => {
      received.push(event.payload?.value ?? 0);
    });

    eventBus.emit("sample.event", { value: 1 });
    eventBus.emit("sample.event", { value: 2 });

    expect(received).toEqual([1]);
  });

  it("keeps listener execution order", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: string[] = [];

    eventBus.on("ordered.event", () => received.push("first"));
    eventBus.on("ordered.event", () => received.push("second"));

    eventBus.emit("ordered.event", { step: "start" });

    expect(received).toEqual(["first", "second"]);
  });

  it("removes all listeners for an event", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: number[] = [];

    eventBus.on("sample.event", (event) => received.push(event.payload?.value ?? 0));
    eventBus.removeAllListeners("sample.event");
    eventBus.emit("sample.event", { value: 1 });

    expect(received).toEqual([]);
  });

  it("emits events without payload when no payload is required", () => {
    const eventBus = createInMemoryEventBus<TestEvents>();
    const received: string[] = [];

    eventBus.on("optional.event", (event) => {
      received.push(event.name);
    });

    eventBus.emit("optional.event");

    expect(received).toEqual(["optional.event"]);
  });
});
