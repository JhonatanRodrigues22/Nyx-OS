import type { PersonalDataRepository, Task } from "./PersonalDataTypes";
import { requireNonEmpty } from "./validation";

export class TaskRepository implements PersonalDataRepository<Task> {
  constructor(private readonly repository: PersonalDataRepository<Task>) {}

  async create(record: Task): Promise<Task> {
    this.validate(record);

    return this.repository.create(record);
  }

  async list(): Promise<Task[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<Task | null> {
    return this.repository.get(id);
  }

  async update(id: string, changes: Partial<Omit<Task, "id">>): Promise<Task> {
    const current = await this.requireExisting(id);
    const next = { ...current, ...changes, id };

    this.validate(next);

    return this.repository.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  private async requireExisting(id: string): Promise<Task> {
    const task = await this.repository.get(id);

    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    return task;
  }

  private validate(task: Task): void {
    requireNonEmpty(task.id, "Task id");
    requireNonEmpty(task.title, "Task title");
  }
}
