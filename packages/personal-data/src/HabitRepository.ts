import type { Habit, PersonalDataRepository } from "./PersonalDataTypes";
import { requireIsoDateLike, requireNonEmpty } from "./validation";

export class HabitRepository implements PersonalDataRepository<Habit> {
  constructor(private readonly repository: PersonalDataRepository<Habit>) {}

  async create(record: Habit): Promise<Habit> {
    this.validate(record);

    return this.repository.create(record);
  }

  async list(): Promise<Habit[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<Habit | null> {
    return this.repository.get(id);
  }

  async update(id: string, changes: Partial<Omit<Habit, "id">>): Promise<Habit> {
    const current = await this.requireExisting(id);
    const next = { ...current, ...changes, id };

    this.validate(next);

    return this.repository.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  private async requireExisting(id: string): Promise<Habit> {
    const habit = await this.repository.get(id);

    if (!habit) {
      throw new Error(`Habit not found: ${id}`);
    }

    return habit;
  }

  private validate(habit: Habit): void {
    requireNonEmpty(habit.id, "Habit id");
    requireNonEmpty(habit.name, "Habit name");
    requireNonEmpty(habit.frequency, "Habit frequency");
    requireIsoDateLike(habit.createdAt, "Habit createdAt");
  }
}
