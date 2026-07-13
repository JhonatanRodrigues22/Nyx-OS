import {
  FinanceRepository,
  HabitRepository,
  InMemoryRepository,
  ProjectRepository,
  TaskRepository,
  type FinanceEntry,
  type Habit,
  type Project,
  type Task
} from "@nyx-os/personal-data";

describe("Personal Data Modules", () => {
  it("creates, lists, reads, updates and deletes tasks through the repository abstraction", async () => {
    const tasks = new TaskRepository(new InMemoryRepository<Task>());

    await tasks.create({
      id: "task-1",
      title: "Prepare sprint note",
      done: false,
      projectId: "project-1"
    });

    await expect(tasks.list()).resolves.toHaveLength(1);
    await expect(tasks.get("task-1")).resolves.toMatchObject({ title: "Prepare sprint note", done: false });

    await tasks.update("task-1", { done: true });

    await expect(tasks.get("task-1")).resolves.toMatchObject({ done: true });

    await tasks.delete("task-1");

    await expect(tasks.list()).resolves.toEqual([]);
  });

  it("rejects a task with an empty title", async () => {
    const tasks = new TaskRepository(new InMemoryRepository<Task>());

    await expect(
      tasks.create({
        id: "task-empty-title",
        title: " ",
        done: false
      })
    ).rejects.toThrow("Task title must not be empty.");
  });

  it("validates habit fields explicitly", async () => {
    const habits = new HabitRepository(new InMemoryRepository<Habit>());

    await expect(
      habits.create({
        id: "habit-1",
        name: "Daily review",
        frequency: "daily",
        createdAt: "2026-07-13T00:00:00.000Z"
      })
    ).resolves.toMatchObject({ id: "habit-1" });

    await expect(
      habits.create({
        id: "habit-invalid-date",
        name: "Invalid date sample",
        frequency: "daily",
        createdAt: "not-a-date"
      })
    ).rejects.toThrow("Habit createdAt must be a valid date string.");
  });

  it("rejects projects with invalid status", async () => {
    const projects = new ProjectRepository(new InMemoryRepository<Project>());

    await expect(
      projects.create({
        id: "project-invalid-status",
        name: "Invalid status sample",
        status: "unknown"
      } as Project)
    ).rejects.toThrow("Project status is invalid: unknown");
  });

  it("rejects finance entries with negative amounts", async () => {
    const entries = new FinanceRepository(new InMemoryRepository<FinanceEntry>());

    await expect(
      entries.create({
        id: "finance-negative",
        description: "Validation sample",
        amount: -1,
        type: "expense",
        date: "2026-07-13"
      })
    ).rejects.toThrow("Finance entry amount must not be negative.");
  });

  it("keeps finance validation active on updates", async () => {
    const entries = new FinanceRepository(new InMemoryRepository<FinanceEntry>());

    await entries.create({
      id: "finance-update",
      description: "Update validation sample",
      amount: 1,
      type: "income",
      date: "2026-07-13"
    });

    await expect(entries.update("finance-update", { amount: -1 })).rejects.toThrow(
      "Finance entry amount must not be negative."
    );
  });
});
