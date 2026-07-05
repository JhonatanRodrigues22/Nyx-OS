import { createInMemoryEventBus, type NyxSystemEvents } from "@nyx-os/event-bus";
import { ConsoleLogger, type ConsoleLoggerSink } from "@nyx-os/logger";
import { SchedulerManager, type ScheduledTask } from "@nyx-os/scheduler";

function createSilentLogger() {
  const sink: ConsoleLoggerSink = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };

  return new ConsoleLogger(sink);
}

function createScheduler() {
  const events = createInMemoryEventBus<NyxSystemEvents>();
  const scheduler = new SchedulerManager({
    events,
    logger: createSilentLogger()
  });

  return {
    events,
    scheduler
  };
}

function createTask(id = "test.task", execute = jest.fn()): ScheduledTask {
  return {
    id,
    name: "Test Task",
    interval: 1000,
    enabled: true,
    execute
  };
}

describe("Nyx scheduler engine", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("registers and lists tasks", () => {
    const { scheduler } = createScheduler();

    scheduler.register(createTask());

    expect(scheduler.getTasks()).toEqual([
      expect.objectContaining({
        id: "test.task",
        name: "Test Task",
        status: "registered"
      })
    ]);
  });

  it("removes tasks", () => {
    const { scheduler } = createScheduler();

    scheduler.register(createTask());
    scheduler.unregister("test.task");

    expect(scheduler.getTasks()).toEqual([]);
  });

  it("executes tasks while running", async () => {
    const { scheduler } = createScheduler();
    const execute = jest.fn();

    scheduler.register(createTask("test.task", execute));
    scheduler.start();

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(scheduler.getTasks()[0]).toMatchObject({
      status: "scheduled"
    });
  });

  it("pauses and resumes task execution", async () => {
    const { scheduler } = createScheduler();
    const execute = jest.fn();

    scheduler.register(createTask("test.task", execute));
    scheduler.start();
    scheduler.pause();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(execute).not.toHaveBeenCalled();
    expect(scheduler.getStatus()).toBe("paused");

    scheduler.resume();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(scheduler.getStatus()).toBe("running");
  });

  it("emits scheduler lifecycle and task events", async () => {
    const { events, scheduler } = createScheduler();
    const received: string[] = [];

    events.on("scheduler.started", (event) => received.push(event.name));
    events.on("scheduler.stopped", (event) => received.push(event.name));
    events.on("scheduler.task.registered", (event) => received.push(event.name));
    events.on("scheduler.task.executed", (event) => received.push(event.name));
    events.on("scheduler.task.removed", (event) => received.push(event.name));

    scheduler.register(createTask());
    scheduler.start();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    scheduler.stop();
    scheduler.unregister("test.task");

    expect(received).toEqual([
      "scheduler.task.registered",
      "scheduler.started",
      "scheduler.task.executed",
      "scheduler.stopped",
      "scheduler.task.removed"
    ]);
  });

  it("marks failed tasks and emits failure events", async () => {
    const { events, scheduler } = createScheduler();
    const failed: string[] = [];

    events.on("scheduler.task.failed", (event) => failed.push(event.payload?.task ?? ""));
    scheduler.register(
      createTask("broken.task", () => {
        throw new Error("broken");
      })
    );
    scheduler.start();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(scheduler.getTasks()[0]).toMatchObject({
      status: "failed",
      lastError: "broken"
    });
    expect(failed).toEqual(["broken.task"]);
  });
});
